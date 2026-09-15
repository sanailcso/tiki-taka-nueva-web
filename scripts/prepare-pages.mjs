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
