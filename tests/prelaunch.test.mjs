import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const text = (path) => readFile(new URL(path, root), "utf8");

test("la salida pública declara canonical, robots y sitemap de producción", async () => {
  const [html, robots, sitemap] = await Promise.all([
    text("dist-pages/index.html"),
    text("dist-pages/robots.txt"),
    text("dist-pages/sitemap.xml"),
  ]);

  assert.match(html, /rel="canonical" href="https:\/\/www\.tikitaka\.es\/"/);
  assert.match(html, /name="robots" content="index, follow/);
  assert.match(robots, /Sitemap: https:\/\/www\.tikitaka\.es\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/www\.tikitaka\.es\/<\/loc>/);
});

test("todas las rutas administrativas generadas quedan fuera de los buscadores", async () => {
  for (const path of ["admin/index.html", "admin/login/index.html", "admin/preview/index.html"]) {
    const html = await text(`dist-pages/${path}`);
    assert.match(html, /name="robots" content="noindex, nofollow, noarchive"/);
    assert.doesNotMatch(html, /rel="canonical"/);
  }
});

test("el paquete inicial público no contiene el CMS ni credenciales administrativas", async () => {
  const assetsDir = new URL("dist-pages/assets/", root);
  const entryName = (await readdir(assetsDir)).find((name) => /^index-[\w-]+\.js$/.test(name));
  assert.ok(entryName, "No se encontró el JavaScript de entrada.");
  const entry = await readFile(new URL(entryName, assetsDir), "utf8");

  assert.doesNotMatch(entry, /signInWithPassword|Backoffice profesional|admin@cms/i);
});

test("la portada usa imágenes optimizadas y los datos corregidos", async () => {
  const [defaults, map, normalized] = await Promise.all([
    text("app/cms/default-content.ts"),
    text("app/salon-map.tsx"),
    text("app/cms/content-normalize.ts"),
  ]);
  const imagePath = join(fileURLToPath(new URL("public/", root)), "hero-headquarters.webp");
  const image = await stat(imagePath);

  assert.match(defaults, /value: "\+70"/);
  assert.match(defaults, /Una red de \+70 ubicaciones/);
  assert.match(map, /Massamagrell/);
  assert.doesNotMatch(map, /Apuestasde?Murcia/i);
  assert.match(normalized, /hero-headquarters\.webp/);
  assert.match(normalized, /DEFAULT_SITE_CONTENT\.commitment\.url/);
  assert.match(await text("index.html"), /"@type":"Organization"/);
  assert.match(await text("index.html"), /"@type":"WebSite"/);
  assert.match(await text("app/hero-slider.tsx"), /fetchPriority=\{index === 0 \? "high"/);
  assert.ok(image.size < 200_000, `La imagen principal pesa ${image.size} bytes.`);
});
