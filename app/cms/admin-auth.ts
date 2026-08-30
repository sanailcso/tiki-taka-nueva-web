import "server-only";

import { env } from "cloudflare:workers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const CREDENTIAL_ID = "primary";
const COOKIE_NAME = "tt_admin_session";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;
const PBKDF2_ITERATIONS = 100_000;

type CredentialRow = {
  username: string;
  password_hash: string;
  password_salt: string;
};

type SessionRow = {
  username: string;
  expires_at: number;
};

export type AdminUser = {
  username: string;
  displayName: string;
  email: string;
};

function database() {
  if (!env.DB) throw new Error("El almacenamiento del backoffice no está disponible.");
  return env.DB;
}

function toUser(username: string): AdminUser {
  return { username, displayName: username, email: username };
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(value: string) {
  if (!/^[a-f0-9]+$/i.test(value) || value.length % 2) return new Uint8Array();
  return new Uint8Array(value.match(/.{2}/g)?.map((pair) => Number.parseInt(pair, 16)) || []);
}

function constantTimeEqual(left: string, right: string) {
  const leftBytes = hexToBytes(left);
  const rightBytes = hexToBytes(right);
  let difference = leftBytes.length ^ rightBytes.length;
  const length = Math.max(leftBytes.length, rightBytes.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] || 0) ^ (rightBytes[index] || 0);
  }
  return difference === 0;
}

async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(bytes));
}

async function hashPassword(password: string, saltHex: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: hexToBytes(saltHex), iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

function randomHex(length = 32) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function readCredentials(): Promise<CredentialRow> {
  const row = await database().prepare(
    "SELECT username, password_hash, password_salt FROM admin_credentials WHERE id = ?",
  ).bind(CREDENTIAL_ID).first<CredentialRow>();
  if (row) return row;
  const initial = env as unknown as {
    CMS_INITIAL_USERNAME?: string;
    CMS_INITIAL_PASSWORD_HASH?: string;
    CMS_INITIAL_PASSWORD_SALT?: string;
  };
  const username = initial.CMS_INITIAL_USERNAME?.trim() || "";
  const passwordHash = initial.CMS_INITIAL_PASSWORD_HASH?.trim() || "";
  const passwordSalt = initial.CMS_INITIAL_PASSWORD_SALT?.trim() || "";
  if (!username || !passwordHash || !passwordSalt) {
    throw new Error("El acceso inicial del backoffice no está configurado.");
  }
  return { username, password_hash: passwordHash, password_salt: passwordSalt };
}

async function passwordMatches(password: string, credential: CredentialRow) {
  return constantTimeEqual(await hashPassword(password, credential.password_salt), credential.password_hash);
}

async function currentSessionToken() {
  return (await cookies()).get(COOKIE_NAME)?.value || "";
}

export async function getAdminSession(): Promise<AdminUser | null> {
  const token = await currentSessionToken();
  if (!token) return null;
  const id = await digest(token);
  const row = await database().prepare(
    "SELECT username, expires_at FROM admin_sessions WHERE id = ?",
  ).bind(id).first<SessionRow>();
  if (!row || row.expires_at <= Date.now()) {
    if (row) await database().prepare("DELETE FROM admin_sessions WHERE id = ?").bind(id).run();
    return null;
  }
  const credential = await readCredentials();
  if (credential.username !== row.username) return null;
  return toUser(row.username);
}

function safeReturnTo(value: string) {
  return value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

export async function requireAdmin(returnTo: string) {
  const user = await getAdminSession();
  if (!user) redirect(`/admin/login?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`);
  return user;
}

export async function getAdminForApi() {
  const user = await getAdminSession();
  if (!user) return { ok: false as const, status: 401, message: "La sesión ha caducado. Vuelve a iniciar sesión." };
  return { ok: true as const, user };
}

export async function assertLoginAllowed(identifier: string) {
  const id = await digest(identifier || "unknown");
  const row = await database().prepare(
    "SELECT failures, window_started_at, blocked_until FROM admin_login_attempts WHERE id = ?",
  ).bind(id).first<{ failures: number; window_started_at: number; blocked_until: number }>();
  if (row?.blocked_until && row.blocked_until > Date.now()) {
    throw new Error("Demasiados intentos. Espera unos minutos antes de volver a probar.");
  }
  return id;
}

async function recordLoginFailure(id: string) {
  const now = Date.now();
  const row = await database().prepare(
    "SELECT failures, window_started_at FROM admin_login_attempts WHERE id = ?",
  ).bind(id).first<{ failures: number; window_started_at: number }>();
  const activeWindow = Boolean(row && now - row.window_started_at < LOGIN_WINDOW_MS);
  const failures = activeWindow ? row!.failures + 1 : 1;
  const windowStartedAt = activeWindow ? row!.window_started_at : now;
  const blockedUntil = failures >= MAX_LOGIN_FAILURES ? now + LOGIN_WINDOW_MS : 0;
  await database().prepare(`
    INSERT INTO admin_login_attempts (id, failures, window_started_at, blocked_until)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET failures = excluded.failures,
      window_started_at = excluded.window_started_at, blocked_until = excluded.blocked_until
  `).bind(id, failures, windowStartedAt, blockedUntil).run();
}

export async function loginAdmin(username: string, password: string, identifier: string) {
  const attemptId = await assertLoginAllowed(identifier);
  const credential = await readCredentials();
  const valid = username.trim() === credential.username && await passwordMatches(password, credential);
  if (!valid) {
    await recordLoginFailure(attemptId);
    throw new Error("Usuario o contraseña incorrectos.");
  }

  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;
  const token = randomHex(32);
  const sessionId = await digest(token);
  await database().batch([
    database().prepare("DELETE FROM admin_login_attempts WHERE id = ?").bind(attemptId),
    database().prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").bind(now),
    database().prepare(
      "INSERT INTO admin_sessions (id, username, created_at, expires_at) VALUES (?, ?, ?, ?)",
    ).bind(sessionId, credential.username, now, expiresAt),
  ]);
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
  return toUser(credential.username);
}

export async function logoutAdmin() {
  const token = await currentSessionToken();
  if (token) await database().prepare("DELETE FROM admin_sessions WHERE id = ?").bind(await digest(token)).run();
  (await cookies()).set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function updateAdminCredentials(input: { currentPassword: string; username: string; newPassword?: string }) {
  const credential = await readCredentials();
  if (!await passwordMatches(input.currentPassword, credential)) {
    throw new Error("La contraseña actual no es correcta.");
  }

  const username = input.username.trim();
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    throw new Error("El usuario debe tener entre 3 y 32 caracteres y solo puede usar letras, números, punto, guion o guion bajo.");
  }
  const password = input.newPassword || "";
  if (password && password.length < 8) throw new Error("La nueva contraseña debe tener al menos 8 caracteres.");
  if (password.length > 128) throw new Error("La nueva contraseña es demasiado larga.");

  const salt = password ? randomHex(24) : credential.password_salt;
  const passwordHash = password ? await hashPassword(password, salt) : credential.password_hash;
  const now = Date.now();
  await database().batch([
    database().prepare(`
      INSERT INTO admin_credentials (id, username, password_hash, password_salt, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET username = excluded.username, password_hash = excluded.password_hash,
        password_salt = excluded.password_salt, updated_at = excluded.updated_at
    `).bind(CREDENTIAL_ID, username, passwordHash, salt, now),
    database().prepare("DELETE FROM admin_sessions"),
  ]);
  (await cookies()).set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
  return { username };
}
