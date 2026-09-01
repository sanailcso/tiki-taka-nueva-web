"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadAdminData, type AdminInitialData } from "../cms/supabase-cms";
import { AdminShell } from "./admin-shell";

function adminPath(suffix = "") {
  if (typeof window === "undefined") return `/admin${suffix ? `/${suffix}` : ""}`;
  const marker = "/admin";
  const index = window.location.pathname.lastIndexOf(marker);
  const root = index >= 0 ? window.location.pathname.slice(0, index + marker.length) : marker;
  return `${root}${suffix ? `/${suffix}` : ""}`;
}

export function SupabaseAdminApp() {
  const [data, setData] = useState<AdminInitialData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminData().then(setData).catch((caught) => {
      const errorMessage = caught instanceof Error ? caught.message : "No se pudo abrir el backoffice.";
      if (errorMessage.toLowerCase().includes("sesión")) {
        window.location.replace(adminPath("login"));
        return;
      }
      setError(errorMessage);
    });
  }, []);

  if (error) return <main className="cms-state"><ShieldAlert /><h1>No se puede abrir el backoffice</h1><p>{error}</p><Button onClick={() => window.location.reload()}>Volver a intentar</Button></main>;
  if (!data) return <main className="cms-state"><Loader2 className="animate-spin" /><h1>Preparando el backoffice</h1><p>Cargando el contenido y la biblioteca multimedia…</p></main>;
  return <AdminShell initial={data.initial} revisions={data.revisions} media={data.media} userName={data.profile.username} />;
}

