"use client";

import { normalizeSiteContent } from "./content-normalize";
import { CMS_CONTENT_ID, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabase-config";

export async function getPublishedContentFromSupabase() {
  const endpoint = new URL(`${SUPABASE_URL}/rest/v1/site_publications`);
  endpoint.searchParams.set("id", `eq.${CMS_CONTENT_ID}`);
  endpoint.searchParams.set("select", "content");
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("No se pudo cargar el contenido publicado.");

  const rows = await response.json() as Array<{ content?: unknown }>;
  if (!rows[0]?.content) throw new Error("No hay contenido publicado.");
  return normalizeSiteContent(rows[0].content);
}
