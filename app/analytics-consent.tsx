"use client";

import { useEffect, useState } from "react";

const MEASUREMENT_ID = "G-X6XCFS15PC";
const STORAGE_KEY = "tikitaka-analytics-consent";

type ConsentChoice = "accepted" | "rejected";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function initialiseConsentMode() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });
}

function enableAnalytics() {
  initialiseConsentMode();
  window.gtag("consent", "update", { analytics_storage: "granted" });

  if (!document.querySelector(`script[data-ga-id="${MEASUREMENT_ID}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    script.dataset.gaId = MEASUREMENT_ID;
    document.head.appendChild(script);
  }

  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true,
  });
}

function disableAnalytics() {
  initialiseConsentMode();
  window.gtag("consent", "update", { analytics_storage: "denied" });
}

export function AnalyticsConsent({ assetBase = "/" }: { assetBase?: string }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    initialiseConsentMode();
    const saved = window.localStorage.getItem(STORAGE_KEY) as ConsentChoice | null;
    if (saved === "accepted") {
      setChoice(saved);
      setAnalyticsAllowed(true);
      enableAnalytics();
    } else if (saved === "rejected") {
      setChoice(saved);
      disableAnalytics();
    }
    setReady(true);
  }, []);

  const saveChoice = (nextChoice: ConsentChoice) => {
    window.localStorage.setItem(STORAGE_KEY, nextChoice);
    setChoice(nextChoice);
    setAnalyticsAllowed(nextChoice === "accepted");
    setShowSettings(false);
    if (nextChoice === "accepted") enableAnalytics();
    else disableAnalytics();
  };

  if (!ready) return null;

  return (
    <>
      {choice === null && (
        <section
          aria-label="Preferencias de privacidad"
          className="fixed inset-x-4 bottom-4 z-[10000] mx-auto max-w-4xl rounded-2xl border border-white/15 bg-[#111113] p-5 text-white shadow-2xl md:p-6"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e4003b]">Tu privacidad</p>
              <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">Cookies y medición</h2>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Utilizamos cookies analíticas para conocer el uso de la web y mejorar la experiencia. Puedes aceptar,
                rechazarlas o configurar tu elección. Consulta nuestra{" "}
                <a className="underline underline-offset-4 hover:text-white" href={`${assetBase}cookies/`}>
                  política de cookies
                </a>.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button className="rounded-full border border-white/35 px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white/10" onClick={() => saveChoice("rejected")}>
                Rechazar
              </button>
              <button className="rounded-full border border-white/35 px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white/10" onClick={() => setShowSettings(true)}>
                Configurar
              </button>
              <button className="rounded-full bg-[#e4003b] px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#ff174f]" onClick={() => saveChoice("accepted")}>
                Aceptar
              </button>
            </div>
          </div>
        </section>
      )}

      {showSettings && choice === null && (
        <div className="fixed inset-0 z-[10001] grid place-items-center bg-black/70 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title" className="w-full max-w-lg rounded-2xl bg-white p-6 text-black shadow-2xl">
            <h2 id="cookie-settings-title" className="text-2xl font-black uppercase">Configurar cookies</h2>
            <div className="mt-5 flex items-center justify-between gap-5 border-b py-4">
              <div><strong>Cookies necesarias</strong><p className="mt-1 text-sm text-black/60">Permiten el funcionamiento básico de la web.</p></div>
              <span className="text-sm font-bold text-black/55">Siempre activas</span>
            </div>
            <label className="flex cursor-pointer items-center justify-between gap-5 py-5">
              <span><strong>Cookies analíticas</strong><span className="mt-1 block text-sm text-black/60">Google Analytics nos ayuda a mejorar la web mediante datos de uso agregados.</span></span>
              <input className="h-5 w-5 accent-[#e4003b]" type="checkbox" checked={analyticsAllowed} onChange={(event) => setAnalyticsAllowed(event.target.checked)} />
            </label>
            <div className="mt-3 flex justify-end gap-2">
              <button className="rounded-full border border-black/30 px-5 py-3 text-xs font-bold uppercase" onClick={() => setShowSettings(false)}>Volver</button>
              <button className="rounded-full bg-[#e4003b] px-5 py-3 text-xs font-bold uppercase text-white" onClick={() => saveChoice(analyticsAllowed ? "accepted" : "rejected")}>Guardar elección</button>
            </div>
          </section>
        </div>
      )}

      {choice !== null && (
        <button
          className="fixed bottom-3 left-3 z-[9999] rounded-full border border-white/20 bg-[#111113] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg hover:bg-black"
          onClick={() => { setChoice(null); setShowSettings(true); }}
          aria-label="Cambiar preferencias de cookies"
        >
          Cookies
        </button>
      )}
    </>
  );
}
