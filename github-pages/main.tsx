import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "../app/globals.css";
import "../app/admin/admin.css";
import { SupabaseAdminApp } from "../app/admin/supabase-admin-app";
import { LoginForm } from "../app/admin/login/login-form";
import { SupabaseDraftPreview } from "../app/admin/preview/supabase-preview";
import { DEFAULT_SITE_CONTENT } from "../app/cms/default-content";
import { getPublishedContentFromSupabase } from "../app/cms/supabase-cms";
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

function PublicSite() {
  const [content, setContent] = useState(() => prefixLocalAssets(structuredClone(DEFAULT_SITE_CONTENT)) as SiteContent);
  useEffect(() => {
    getPublishedContentFromSupabase()
      .then((published) => setContent(prefixLocalAssets(published)))
      .catch(() => undefined);
  }, []);
  return <SitePage content={content} assetBase={assetBase} />;
}

const path = window.location.pathname.replace(/\/+$/, "");
const app = path.endsWith("/admin/preview")
  ? <SupabaseDraftPreview />
  : path.endsWith("/admin/login")
    ? <LoginForm returnTo="/admin" />
    : path.endsWith("/admin")
      ? <SupabaseAdminApp />
      : <PublicSite />;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {app}
  </React.StrictMode>,
);
