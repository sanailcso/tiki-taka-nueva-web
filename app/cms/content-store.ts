import "server-only";
import { DEFAULT_SITE_CONTENT } from "./default-content";
import { normalizeSiteContent } from "./content-normalize";
import { CMS_CONTENT_ID, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabase-config";
import type { ContentRevision, MediaAsset, SiteContent } from "./types";

const ROW_ID = "main";

type ContentRow = {
  draft_json: string;
  published_json: string;
  draft_updated_at: number;
  published_at: number;
  updated_by: string;
  version: number;
};

async function binding() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("El almacenamiento del backoffice no está disponible.");
  return env.DB;
}

function cloneDefaults(): SiteContent {
  return structuredClone(DEFAULT_SITE_CONTENT);
}

function parseContent(value: string | null | undefined): SiteContent {
  if (!value) return cloneDefaults();
  try {
    return normalizeSiteContent(JSON.parse(value));
  } catch {
    return cloneDefaults();
  }
}

async function readRow(): Promise<ContentRow | null> {
  return (await binding()).prepare(
    "SELECT draft_json, published_json, draft_updated_at, published_at, updated_by, version FROM site_content WHERE id = ?",
  ).bind(ROW_ID).first<ContentRow>();
}

export async function getPublishedSiteContent(): Promise<SiteContent> {
  try {
    const endpoint = new URL(`${SUPABASE_URL}/rest/v1/site_publications`);
    endpoint.searchParams.set("id", `eq.${CMS_CONTENT_ID}`);
    endpoint.searchParams.set("select", "content");
    const response = await fetch(endpoint, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
      cache: "no-store",
    });
    if (response.ok) {
      const rows = await response.json() as Array<{ content: unknown }>;
      if (rows[0]?.content) return normalizeSiteContent(rows[0].content);
    }
  } catch {
    // La base anterior permanece como respaldo durante la migración.
  }
  try {
    const row = await readRow();
    return parseContent(row?.published_json);
  } catch {
    return cloneDefaults();
  }
}

export async function getDraftSiteContent(): Promise<{ content: SiteContent; version: number; updatedAt: number; publishedAt: number }> {
  const row = await readRow();
  return {
    content: parseContent(row?.draft_json),
    version: row?.version ?? 0,
    updatedAt: row?.draft_updated_at ?? 0,
    publishedAt: row?.published_at ?? 0,
  };
}

export async function saveDraft(input: unknown, email: string) {
  const content = normalizeSiteContent(input);
  const json = JSON.stringify(content);
  if (json.length > 1_500_000) throw new Error("El contenido supera el tamaño permitido.");
  const row = await readRow();
  const now = Date.now();
  const published = row?.published_json ?? JSON.stringify(DEFAULT_SITE_CONTENT);
  await (await binding()).prepare(`
    INSERT INTO site_content (id, draft_json, published_json, draft_updated_at, published_at, updated_by, version)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET draft_json = excluded.draft_json, draft_updated_at = excluded.draft_updated_at, updated_by = excluded.updated_by
  `).bind(ROW_ID, json, published, now, row?.published_at ?? 0, email, row?.version ?? 0).run();
  return { content, updatedAt: now, version: row?.version ?? 0 };
}

export async function publishDraft(email: string) {
  const row = await readRow();
  const content = parseContent(row?.draft_json);
  const json = JSON.stringify(content);
  const now = Date.now();
  const version = (row?.version ?? 0) + 1;
  const revisionId = crypto.randomUUID();
  const database = await binding();
  const revision = database.prepare(
    "INSERT INTO content_revisions (id, version, content_json, created_at, created_by, action) VALUES (?, ?, ?, ?, ?, ?)",
  ).bind(revisionId, version, json, now, email, "published");
  const update = database.prepare(`
    INSERT INTO site_content (id, draft_json, published_json, draft_updated_at, published_at, updated_by, version)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET draft_json = excluded.draft_json, published_json = excluded.published_json,
      draft_updated_at = excluded.draft_updated_at, published_at = excluded.published_at, updated_by = excluded.updated_by, version = excluded.version
  `).bind(ROW_ID, json, json, now, now, email, version);
  await database.batch([revision, update]);
  return { content, version, publishedAt: now };
}

export async function listRevisions(): Promise<ContentRevision[]> {
  const result = await (await binding()).prepare(
    "SELECT id, version, created_at AS createdAt, created_by AS createdBy, action FROM content_revisions ORDER BY version DESC LIMIT 30",
  ).all<ContentRevision>();
  return result.results;
}

export async function restoreRevision(id: string, email: string) {
  const revision = await (await binding()).prepare("SELECT content_json FROM content_revisions WHERE id = ?").bind(id).first<{ content_json: string }>();
  if (!revision) throw new Error("No se ha encontrado esa versión.");
  const content = parseContent(revision.content_json);
  const now = Date.now();
  await (await binding()).prepare("UPDATE site_content SET draft_json = ?, draft_updated_at = ?, updated_by = ? WHERE id = ?")
    .bind(JSON.stringify(content), now, email, ROW_ID).run();
  return { content, updatedAt: now };
}

export async function listMedia(): Promise<MediaAsset[]> {
  const result = await (await binding()).prepare(`
    SELECT id, storage_key AS storageKey, filename, mime_type AS mimeType, size, alt_text AS altText,
      created_at AS createdAt, created_by AS createdBy FROM media_assets ORDER BY created_at DESC LIMIT 150
  `).all<Omit<MediaAsset, "url">>();
  return result.results.map((asset: Omit<MediaAsset, "url">) => ({ ...asset, url: publicMediaUrl(asset.storageKey) }));
}

function publicMediaUrl(storageKey: string) {
  if (!storageKey.startsWith("external:")) return `/media/${storageKey}`;
  try {
    return decodeURIComponent(storageKey.split(":").slice(2).join(":"));
  } catch {
    return "";
  }
}

export async function saveMediaMetadata(asset: Omit<MediaAsset, "url">) {
  await (await binding()).prepare(`
    INSERT INTO media_assets (id, storage_key, filename, mime_type, size, alt_text, created_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(asset.id, asset.storageKey, asset.filename, asset.mimeType, asset.size, asset.altText, asset.createdAt, asset.createdBy).run();
}
