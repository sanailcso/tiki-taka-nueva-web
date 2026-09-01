"use client";

import { normalizeSiteContent } from "./content-normalize";
import { CMS_ADMIN_EMAIL, CMS_CONTENT_ID, CMS_MEDIA_BUCKET } from "./supabase-config";
import { supabase } from "./supabase-client";
import type { ContentRevision, MediaAsset, SiteContent } from "./types";

export type AdminProfile = {
  userId: string;
  username: string;
  displayName: string;
};

export type AdminInitialData = {
  initial: { content: SiteContent; version: number; updatedAt: number; publishedAt: number };
  revisions: ContentRevision[];
  media: MediaAsset[];
  profile: AdminProfile;
};

function message(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    if (error.message.toLowerCase().includes("invalid login credentials")) return "Usuario o contraseña incorrectos.";
    return error.message;
  }
  return fallback;
}

function timestamp(value: string | null | undefined) {
  return value ? new Date(value).getTime() : 0;
}

async function currentProfile(): Promise<AdminProfile> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("La sesión ha caducado. Vuelve a iniciar sesión.");
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("user_id, username, display_name, active")
    .eq("user_id", userData.user.id)
    .single();
  if (error || !data?.active) throw new Error("Este usuario no tiene acceso al backoffice.");
  return {
    userId: data.user_id,
    username: data.username,
    displayName: data.display_name || data.username,
  };
}

export async function loginCms(username: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: CMS_ADMIN_EMAIL, password });
  if (error) throw new Error(message(error, "No se ha podido iniciar sesión."));
  try {
    const profile = await currentProfile();
    if (profile.username.toLocaleLowerCase("es") !== username.trim().toLocaleLowerCase("es")) {
      throw new Error("Usuario o contraseña incorrectos.");
    }
    return profile;
  } catch (error) {
    await supabase.auth.signOut();
    throw error;
  }
}

export async function logoutCms() {
  await supabase.auth.signOut();
}

export async function loadAdminData(): Promise<AdminInitialData> {
  const profile = await currentProfile();
  const [draftResult, publicationResult, revisionsResult, mediaResult] = await Promise.all([
    supabase.from("site_drafts").select("content, updated_at").eq("id", CMS_CONTENT_ID).single(),
    supabase.from("site_publications").select("published_at").eq("id", CMS_CONTENT_ID).single(),
    supabase.from("content_revisions").select("id, created_at, created_by", { count: "exact" })
      .eq("content_id", CMS_CONTENT_ID).eq("kind", "published").order("created_at", { ascending: false }).limit(30),
    supabase.from("media_assets").select("id, name, alt_text, source_type, storage_path, public_url, mime_type, size_bytes, created_at, created_by")
      .order("created_at", { ascending: false }).limit(150),
  ]);
  if (draftResult.error) throw new Error(message(draftResult.error, "No se pudo cargar el borrador."));
  if (revisionsResult.error) throw new Error(message(revisionsResult.error, "No se pudo cargar el historial."));
  if (mediaResult.error) throw new Error(message(mediaResult.error, "No se pudo cargar la biblioteca."));

  const totalVersions = revisionsResult.count ?? revisionsResult.data.length;
  const revisions = revisionsResult.data.map((row, index) => ({
    id: String(row.id),
    version: Math.max(1, totalVersions - index),
    createdAt: timestamp(row.created_at),
    createdBy: row.created_by || profile.username,
    action: "published",
  }));
  const media = mediaResult.data.map((row) => ({
    id: row.id,
    storageKey: row.storage_path || `external:${row.id}`,
    filename: row.name,
    mimeType: row.mime_type || (row.source_type === "url" ? "image/external" : "application/octet-stream"),
    size: Number(row.size_bytes || 0),
    altText: row.alt_text || "",
    createdAt: timestamp(row.created_at),
    createdBy: row.created_by || profile.username,
    url: row.public_url,
  }));

  return {
    profile,
    initial: {
      content: normalizeSiteContent(draftResult.data.content),
      version: totalVersions,
      updatedAt: timestamp(draftResult.data.updated_at),
      publishedAt: timestamp(publicationResult.data?.published_at),
    },
    revisions,
    media,
  };
}

export async function saveCmsDraft(content: SiteContent) {
  const profile = await currentProfile();
  const normalized = normalizeSiteContent(content);
  const serialized = JSON.stringify(normalized);
  if (serialized.length > 1_500_000) throw new Error("El contenido supera el tamaño permitido.");
  const updatedAt = new Date().toISOString();
  const { error } = await supabase.from("site_drafts").upsert({
    id: CMS_CONTENT_ID,
    content: normalized,
    updated_at: updatedAt,
    updated_by: profile.userId,
  }, { onConflict: "id" });
  if (error) throw new Error(message(error, "No se pudo guardar el borrador."));
  return { content: normalized, updatedAt: timestamp(updatedAt) };
}

export async function publishCmsDraft() {
  const { data, error } = await supabase.rpc("publish_site_content", { p_id: CMS_CONTENT_ID });
  if (error) throw new Error(message(error, "No se pudo publicar."));
  const [{ count }, revisions] = await Promise.all([
    supabase.from("content_revisions").select("id", { count: "exact", head: true })
      .eq("content_id", CMS_CONTENT_ID).eq("kind", "published"),
    listCmsRevisions(),
  ]);
  const publication = Array.isArray(data) ? data[0] : data;
  return { version: count ?? revisions.length, publishedAt: timestamp(publication?.published_at), revisions };
}

export async function listCmsRevisions(): Promise<ContentRevision[]> {
  const { data, count, error } = await supabase.from("content_revisions")
    .select("id, created_at, created_by", { count: "exact" })
    .eq("content_id", CMS_CONTENT_ID).eq("kind", "published")
    .order("created_at", { ascending: false }).limit(30);
  if (error) throw new Error(message(error, "No se pudo cargar el historial."));
  const total = count ?? data.length;
  return data.map((row, index) => ({
    id: String(row.id), version: Math.max(1, total - index), createdAt: timestamp(row.created_at),
    createdBy: row.created_by || "admin", action: "published",
  }));
}

export async function restoreCmsRevision(id: string) {
  const profile = await currentProfile();
  const { data, error } = await supabase.from("content_revisions")
    .select("content").eq("id", id).eq("content_id", CMS_CONTENT_ID).single();
  if (error || !data) throw new Error("No se ha encontrado esa versión.");
  const content = normalizeSiteContent(data.content);
  const result = await saveCmsDraft(content);
  return { ...result, restoredBy: profile.username };
}

function safeExtension(name: string) {
  const extension = name.includes(".") ? name.split(".").pop() : "bin";
  return (extension || "bin").replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
}

export async function uploadCmsMedia(file: File, altText = ""): Promise<MediaAsset> {
  const profile = await currentProfile();
  if (file.size > 50 * 1024 * 1024) throw new Error("El archivo supera el límite de 50 MB.");
  const id = crypto.randomUUID();
  const storageKey = `${new Date().toISOString().slice(0, 10)}/${id}.${safeExtension(file.name)}`;
  const { error: uploadError } = await supabase.storage.from(CMS_MEDIA_BUCKET).upload(storageKey, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) throw new Error(message(uploadError, "No se pudo subir el archivo."));
  const { data: publicData } = supabase.storage.from(CMS_MEDIA_BUCKET).getPublicUrl(storageKey);
  const asset: MediaAsset = {
    id, storageKey, filename: file.name.slice(0, 240), mimeType: file.type || "application/octet-stream",
    size: file.size, altText: altText.trim().slice(0, 240), createdAt: Date.now(),
    createdBy: profile.username, url: publicData.publicUrl,
  };
  const { error: metadataError } = await supabase.from("media_assets").insert({
    id, name: asset.filename, alt_text: asset.altText, source_type: "upload", storage_path: storageKey,
    public_url: asset.url, mime_type: asset.mimeType, size_bytes: asset.size, created_by: profile.userId,
  });
  if (metadataError) {
    await supabase.storage.from(CMS_MEDIA_BUCKET).remove([storageKey]);
    throw new Error(message(metadataError, "No se pudo registrar el archivo."));
  }
  return asset;
}

export async function addCmsMediaUrl(url: string, kind: "image" | "video"): Promise<MediaAsset> {
  const profile = await currentProfile();
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error("La URL debe comenzar por https:// o http://.");
  const id = crypto.randomUUID();
  const filename = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || `multimedia-${id.slice(0, 8)}`).slice(0, 240);
  const asset: MediaAsset = {
    id, storageKey: `external:${id}`, filename, mimeType: `${kind}/external`, size: 0,
    altText: "", createdAt: Date.now(), createdBy: profile.username, url: parsed.toString(),
  };
  const { error } = await supabase.from("media_assets").insert({
    id, name: filename, alt_text: "", source_type: "url", external_url: asset.url,
    public_url: asset.url, mime_type: asset.mimeType, size_bytes: 0, created_by: profile.userId,
  });
  if (error) throw new Error(message(error, "No se pudo añadir la URL."));
  return asset;
}

export async function updateCmsCredentials(input: { currentPassword: string; username: string; newPassword?: string }) {
  const username = input.username.trim();
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    throw new Error("El usuario debe tener entre 3 y 32 caracteres y solo puede usar letras, números, punto, guion o guion bajo.");
  }
  if (input.newPassword && input.newPassword.length < 8) throw new Error("La nueva contraseña debe tener al menos 8 caracteres.");
  const { error: loginError } = await supabase.auth.signInWithPassword({ email: CMS_ADMIN_EMAIL, password: input.currentPassword });
  if (loginError) throw new Error("La contraseña actual no es correcta.");
  const profile = await currentProfile();
  const { error: profileError } = await supabase.from("admin_profiles")
    .update({ username }).eq("user_id", profile.userId);
  if (profileError) throw new Error(message(profileError, "No se pudo cambiar el usuario."));
  if (input.newPassword) {
    const { error: passwordError } = await supabase.auth.updateUser({ password: input.newPassword });
    if (passwordError) throw new Error(message(passwordError, "No se pudo cambiar la contraseña."));
  }
  await supabase.auth.signOut();
  return { username };
}

export async function getPublishedContentFromSupabase() {
  const { data, error } = await supabase.from("site_publications").select("content").eq("id", CMS_CONTENT_ID).single();
  if (error || !data) throw new Error("No se pudo cargar el contenido publicado.");
  return normalizeSiteContent(data.content);
}

