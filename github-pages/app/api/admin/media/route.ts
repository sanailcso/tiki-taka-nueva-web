import { NextResponse } from "next/server";
import { getAdminForApi } from "../../../cms/admin-auth";
import { listMedia, saveMediaMetadata } from "../../../cms/content-store";

export const dynamic = "force-dynamic";
const MAX_UPLOAD_BYTES = 800 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "video/mp4", "video/webm"]);

export async function GET() {
  const auth = await getAdminForApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  return NextResponse.json({ assets: await listMedia() });
}

export async function POST(request: Request) {
  const auth = await getAdminForApi();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  try {
    const form = await request.formData();
    const url = String(form.get("url") || "").trim();
    if (url) {
      if (url.length > 2048) throw new Error("La URL es demasiado larga.");
      const parsed = new URL(url, request.url);
      if (!url.startsWith("/") && parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("La URL debe comenzar por https://, http:// o /.");
      }
      const normalizedUrl = url.startsWith("/") ? `${parsed.pathname}${parsed.search}` : parsed.toString();
      const kind = form.get("kind") === "video" ? "video" : "image";
      const id = crypto.randomUUID();
      const rawName = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || `multimedia-${id.slice(0, 8)}`);
      const filename = rawName.slice(0, 240);
      const storageKey = `external:${id}:${encodeURIComponent(normalizedUrl)}`;
      const altText = String(form.get("altText") || "").trim().slice(0, 240);
      const asset = { id, storageKey, filename, mimeType: `${kind}/external`, size: 0, altText, createdAt: Date.now(), createdBy: auth.user.email };
      await saveMediaMetadata(asset);
      return NextResponse.json({ asset: { ...asset, url: normalizedUrl } });
    }
    const file = form.get("file");
    const altText = String(form.get("altText") || "").trim().slice(0, 240);
    if (!(file instanceof File)) throw new Error("Selecciona una imagen o un vídeo.");
    if (!ALLOWED_TYPES.has(file.type)) throw new Error("Formato no admitido. Usa JPG, PNG, WebP, GIF, SVG, MP4 o WebM.");
    if (file.size > MAX_UPLOAD_BYTES) throw new Error("El archivo supera el límite de carga directa. Redúcelo o añádelo mediante una URL.");
    const id = crypto.randomUUID();
    const extension = file.name.includes(".") ? file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() : "bin";
    const storageKey = `${new Date().toISOString().slice(0, 10)}/${id}.${extension || "bin"}`;
    const { env } = await import("cloudflare:workers");
    await env.BUCKET.put(storageKey, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
    const asset = { id, storageKey, filename: file.name.slice(0, 240), mimeType: file.type, size: file.size, altText, createdAt: Date.now(), createdBy: auth.user.email };
    try {
      await saveMediaMetadata(asset);
    } catch (error) {
      await env.BUCKET.delete(storageKey);
      throw error;
    }
    return NextResponse.json({ asset: { ...asset, url: `/media/${storageKey}` } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo subir el archivo." }, { status: 400 });
  }
}
