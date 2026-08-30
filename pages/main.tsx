import React from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "../app/globals.css";
import { DEFAULT_SITE_CONTENT } from "../app/cms/default-content";
import type { SiteContent } from "../app/cms/types";
import { SitePage } from "../app/site-page";

const assetBase = import.meta.env.BASE_URL;

function prefixLocalAssets<T>(value: T): T {
  if (typeof value === "string") {
    return (value.startsWith("/") ? `${assetBase}${value.slice(1)}` : value) as T;
  }
  if (Array.isArray(value)) return value.map(prefixLocalAssets) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, prefixLocalAssets(item)]),
    ) as T;
  }
  return value;
}

const content = prefixLocalAssets(structuredClone(DEFAULT_SITE_CONTENT)) as SiteContent;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SitePage content={content} assetBase={assetBase} />
  </React.StrictMode>,
);
