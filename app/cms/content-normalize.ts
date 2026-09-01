import { DEFAULT_SITE_CONTENT } from "./default-content";
import type { SiteContent } from "./types";

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
  merged.hero.slides = merged.hero.slides.slice(0, 12).filter((slide) => slide && slide.id && slide.src);
  if (!merged.hero.slides.length) merged.hero.slides = structuredClone(DEFAULT_SITE_CONTENT.hero.slides);
  merged.salons = merged.salons.slice(0, 250);
  merged.motion.heroCycleSeconds = Math.min(30, Math.max(3, Number(merged.motion.heroCycleSeconds) || 6));
  merged.motion.machinesPlaybackRate = Math.min(1.5, Math.max(0.1, Number(merged.motion.machinesPlaybackRate) || 0.5));
  merged.motion.playSceneHeight = Math.min(500, Math.max(140, Number(merged.motion.playSceneHeight) || 190));
  return merged;
}

