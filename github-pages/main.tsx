import React from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "../app/globals.css";
import "../app/admin/admin.css";
import { SupabaseAdminApp } from "../app/admin/supabase-admin-app";
import { LoginForm } from "../app/admin/login/login-form";
import { SupabaseDraftPreview } from "../app/admin/preview/supabase-preview";
import { PublicSite } from "../app/public-site";

const assetBase = import.meta.env.BASE_URL;

const path = window.location.pathname.replace(/\/+$/, "");
const app = path.endsWith("/admin/preview")
  ? <SupabaseDraftPreview />
  : path.endsWith("/admin/login")
    ? <LoginForm returnTo="/admin" />
    : path.endsWith("/admin")
      ? <SupabaseAdminApp />
      : <PublicSite assetBase={assetBase} />;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {app}
  </React.StrictMode>,
);
