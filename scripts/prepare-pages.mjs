import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("dist-pages");
const publicHtml = await readFile(path.join(output, "index.html"), "utf8");
const adminHtml = publicHtml
  .replace(/<meta name="robots" content="[^"]*"\s*\/?>(?:\s*)/i, "")
  .replace(/<link rel="canonical"[^>]*>(?:\s*)/i, "")
  .replace(/<meta property="og:url"[^>]*>(?:\s*)/i, "")
  .replace("<title>Tiki Taka Games</title>", "<title>Acceso privado | Tiki Taka Games</title>")
  .replace(
    "<head>",
    '<head>\n    <meta name="robots" content="noindex, nofollow, noarchive" />\n    <meta name="referrer" content="no-referrer" />',
  );

for (const route of ["admin", "admin/login", "admin/preview"]) {
  const directory = path.join(output, route);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), adminHtml, "utf8");
}

const legalPages = {
  "aviso-legal": ["Aviso legal", "Identificación del titular y condiciones de uso de la web de Tiki Taka Games."],
  privacidad: ["Política de privacidad", "Información sobre el tratamiento y la protección de datos personales en Tiki Taka Games."],
  cookies: ["Política de cookies", "Información sobre las cookies, Google Analytics y tus preferencias de privacidad."],
};

for (const [route, [title, description]] of Object.entries(legalPages)) {
  const canonical = `https://www.tikitaka.es/${route}/`;
  const html = publicHtml
    .replace(/<link rel="preload" as="image"[^>]*>(?:\s*)/i, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>(?:\s*)/i, "")
    .replace(/<title>[^<]*<\/title>/i, `<title>${title} | Tiki Taka Games</title>`)
    .replace(/<meta name="description"[\s\S]*?\/>/i, `<meta name="description" content="${description}" />`)
    .replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${title} | Tiki Taka Games" />`)
    .replace(/<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${title} | Tiki Taka Games" />`)
    .replace(/<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${description}" />`);
  const directory = path.join(output, route);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), html, "utf8");
}
