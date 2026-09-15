export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { env } = await import("cloudflare:workers");
  const { key } = await context.params;
  const object = await env.BUCKET.get(key.join("/"));
  if (!object) return new Response("Archivo no encontrado", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
