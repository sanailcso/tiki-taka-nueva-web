import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://www.tikitaka.es/", changeFrequency: "monthly", priority: 1 }];
}
