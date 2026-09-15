"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { loadAdminData } from "../../cms/supabase-cms";
import type { SiteContent } from "../../cms/types";
import { SitePage } from "../../site-page";

function adminRoot() {
  if (typeof window === "undefined") return "/admin";
  const index = window.location.pathname.lastIndexOf("/admin");
  return index >= 0 ? window.location.pathname.slice(0, index + 6) : "/admin";
}

export function SupabaseDraftPreview() {
  const [content, setContent] = useState<SiteContent | null>(null);
  useEffect(() => {
    loadAdminData().then((data) => setContent(data.initial.content)).catch(() => {
      window.location.replace(`${adminRoot()}/login`);
    });
  }, []);
  if (!content) return <main className="cms-state"><Loader2 className="animate-spin" /><h1>Cargando vista previa</h1></main>;
  return <><div className="draft-preview-bar"><strong>Vista previa del borrador</strong><a href={adminRoot()}>Volver al backoffice</a></div><SitePage content={content} /></>;
}

