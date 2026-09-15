import { DEFAULT_SITE_CONTENT } from "./default-content";
import type { SiteContent } from "./types";

const correctedMapLinks: Record<string, string> = {
  "Águilas · Alegría": "https://www.google.com/maps/search/?api=1&query=Tiki+Taka+Alegr%C3%ADa+de+la+Huerta%2C+Callej%C3%B3n+de+la+Huerta+6%2C+30880+%C3%81guilas",
  "Águilas · El Puerto": "https://www.google.com/maps/search/?api=1&query=Tiki+Taka+El+Puerto%2C+Paseo+de+Isaac+Peral+11%2C+30880+%C3%81guilas",
  "Águilas · Las Yucas": "https://www.google.com/maps/search/?api=1&query=Tiki+Taka+Las+Yucas%2C+Calle+Pintor+Rosales+5%2C+30880+%C3%81guilas",
  "Águilas · Las Molinetas": "https://www.google.com/maps/search/?api=1&query=Tiki+Taka+Las+Molinetas%2C+Calle+Murcia+15%2C+30880+%C3%81guilas",
  "Las Candelas": "https://www.google.com/maps/search/?api=1&query=Tiki+Taka+Las+Candelas%2C+Almer%C3%ADa",
  "Almanzora": "https://www.google.com/maps/search/?api=1&query=Tiki+Taka+Almanzora%2C+Almer%C3%ADa",
};

function cloneDefaults(): SiteContent {
  return structuredClone(DEFAULT_SITE_CONTENT);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeDefaults<T>(base: T, value: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(value) ? value : base) as T;
  if (isRecord(base)) {
    const incoming = isRecord(value) ? value : {};
    return Object.fromEntries(
      Object.entries(base).map(([key, fallback]) => [key, mergeDefaults(fallback, incoming[key])]),
    ) as T;
  }
  return (typeof value === typeof base ? value : base) as T;
}

export function normalizeSiteContent(value: unknown): SiteContent {
  const merged = mergeDefaults(cloneDefaults(), value);
  if (merged.intro.title === "Mucho más que una empresa de juego.") {
    merged.intro.title = "Una forma diferente de entender el ocio.";
  }
  const salonsProof = merged.proof.values.find((item) => item.label.trim().toLocaleLowerCase("es") === "salones de juego");
  if (salonsProof && ["+60", "60", "68", "+70", "70", "más de 70"].includes(salonsProof.value.trim().toLocaleLowerCase("es"))) salonsProof.value = "Más de 70";
  if (["+60", "60", "68", "+70", "70", "más de 70"].includes(merged.finder.count.trim().toLocaleLowerCase("es"))) merged.finder.count = "Más de 70";
  merged.history.entries = merged.history.entries.map((entry) => ({
    ...entry,
    description: entry.description.replace(/Una red de (?:68|\+?70|más de 70) ubicaciones/i, "Una red de más de 70 ubicaciones"),
  }));
  if (merged.footer.privacyUrl === "https://www.tikitaka.es/politica-de-privacidad/") {
    merged.footer.privacyUrl = "https://www.tikitaka.es/politica-privacidad/";
  }
  const cafetiko = DEFAULT_SITE_CONTENT.areas.cards.find((card) => card.title === "Cafetiko");
  if (cafetiko && !merged.areas.cards.some((card) => card.title.trim().toLocaleLowerCase("es") === "cafetiko")) {
    merged.areas.cards.push(structuredClone(cafetiko));
  }
  const currentCafetiko = merged.areas.cards.find((card) => card.title.trim().toLocaleLowerCase("es") === "cafetiko");
  if (currentCafetiko && currentCafetiko.eyebrow.trim().toLocaleLowerCase("es") === "nueva línea de restauración") {
    currentCafetiko.eyebrow = "Línea de restauración";
  }
  if (merged.areas.description === "Espacios de ocio, apuestas deportivas y soluciones para establecimientos, con una atención cercana y una identidad reconocible.") {
    merged.areas.description = DEFAULT_SITE_CONTENT.areas.description;
  }
  merged.hero.slides = merged.hero.slides.slice(0, 12).filter((slide) => slide && slide.id && slide.src);
  if (!merged.hero.slides.length) merged.hero.slides = structuredClone(DEFAULT_SITE_CONTENT.hero.slides);
  merged.hero.slides = merged.hero.slides.map((slide) => {
    if (slide.src.includes("d0405b7f-a20a-4d68-96a7-1d0fd05a5a77.png")) {
      return { ...slide, src: "/hero-headquarters.webp" };
    }
    return slide;
  });
  merged.salons = merged.salons.slice(0, 250);
  merged.salons = merged.salons.map((salon) => {
    if (/^(?:Tiki Taka )?Massanassa$/i.test(salon.name.trim())) {
      return { ...salon, name: "Massamagrell", lat: 39.576127, lng: -0.3281499 };
    }
    const correctedHref = correctedMapLinks[salon.name];
    if (correctedHref && (/apuestasde?murcia/i.test(salon.href) || ["Las Candelas", "Almanzora"].includes(salon.name))) {
      return { ...salon, href: correctedHref };
    }
    return salon;
  });
  merged.motion.heroCycleSeconds = Math.min(30, Math.max(3, Number(merged.motion.heroCycleSeconds) || 6));
  merged.motion.machinesPlaybackRate = Math.min(1.5, Math.max(0.1, Number(merged.motion.machinesPlaybackRate) || 0.5));
  merged.motion.playSceneHeight = Math.min(160, Math.max(120, Number(merged.motion.playSceneHeight) || 160));
  return merged;
}
