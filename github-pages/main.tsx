import React from "react";
import { createRoot } from "react-dom/client";
import "../app/globals.css";

const assetBase = import.meta.env.BASE_URL;

const path = window.location.pathname.replace(/\/+$/, "");

async function loadApp() {
  const legalKind = (["aviso-legal", "privacidad", "cookies"] as const).find((kind) => path.endsWith(`/${kind}`));
  if (legalKind) {
    const { LegalPage } = await import("../app/legal-page");
    return <LegalPage kind={legalKind} assetBase={assetBase} />;
  }
  if (path.endsWith("/admin/preview")) {
    await import("../app/admin/admin.css");
    const { SupabaseDraftPreview } = await import("../app/admin/preview/supabase-preview");
    return <SupabaseDraftPreview />;
  }
  if (path.endsWith("/admin/login")) {
    await import("../app/admin/admin.css");
    const { LoginForm } = await import("../app/admin/login/login-form");
    return <LoginForm returnTo="/admin" />;
  }
  if (path.endsWith("/admin")) {
    await import("../app/admin/admin.css");
    const { SupabaseAdminApp } = await import("../app/admin/supabase-admin-app");
    return <SupabaseAdminApp />;
  }
  const { PublicSite } = await import("../app/public-site");
  return <PublicSite assetBase={assetBase} />;
}

async function bootstrap() {
  const app = await loadApp();
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>{app}</React.StrictMode>,
  );
}

void bootstrap();
