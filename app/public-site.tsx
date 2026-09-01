"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SITE_CONTENT } from "./cms/default-content";
import { getPublishedContentFromSupabase } from "./cms/supabase-cms";
import type { SiteContent } from "./cms/types";
import { SitePage } from "./site-page";

function prefixLocalAssets<T>(value: T, assetBase: string): T {
  if (!assetBase) return value;
  if (typeof value === "string") {
    return (value.startsWith("/") ? `${assetBase}${value.slice(1)}` : value) as T;
  }
  if (Array.isArray(value)) return value.map((item) => prefixLocalAssets(item, assetBase)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, prefixLocalAssets(item, assetBase)]),
    ) as T;
  }
  return value;
}

export function PublicSite({ assetBase = "" }: { assetBase?: string }) {
  const [content, setContent] = useState<SiteContent>(() =>
    prefixLocalAssets(structuredClone(DEFAULT_SITE_CONTENT), assetBase),
  );

  useEffect(() => {
    getPublishedContentFromSupabase()
      .then((published) => setContent(prefixLocalAssets(published, assetBase)))
      .catch(() => undefined);
  }, [assetBase]);

  return <SitePage content={content} assetBase={assetBase} />;
}
