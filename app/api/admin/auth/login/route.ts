import { NextResponse } from "next/server";
import { loginAdmin } from "../../../../cms/admin-auth";

export const dynamic = "force-dynamic";

function safeReturnTo(value: unknown) {
  return typeof value === "string" && value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: unknown; password?: unknown; returnTo?: unknown };
    const username = typeof body.username === "string" ? body.username.slice(0, 64) : "";
    const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
    if (!username || !password) throw new Error("Escribe el usuario y la contraseña.");
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const identifier = request.headers.get("cf-connecting-ip") || forwarded || "unknown";
    await loginAdmin(username, password, identifier);
    return NextResponse.json({ ok: true, returnTo: safeReturnTo(body.returnTo) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se ha podido iniciar sesión." },
      { status: 401 },
    );
  }
}
