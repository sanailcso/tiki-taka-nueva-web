"use client";

import { useEffect } from "react";

export function MotionLayer() {
  useEffect(() => {
    // La narrativa de marca debe conservarse también en navegadores integrados,
    // que a menudo declaran movimiento reducido sin que el visitante lo haya elegido.
    const reducedMotion = false;
    const introSeen = window.sessionStorage.getItem("tt-brand-intro-seen") === "1";
    const readyTimer = window.setTimeout(() => {
      document.body.classList.add("site-ready");
      window.sessionStorage.setItem("tt-brand-intro-seen", "1");
    }, reducedMotion || introSeen ? 0 : 1050);
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const tunedVideos = document.querySelectorAll<HTMLVideoElement>("video[data-playback-rate]");
    const tuneVideo = (video: HTMLVideoElement) => {
      const rate = Number(video.dataset.playbackRate || 1);
      video.defaultPlaybackRate = rate;
      video.playbackRate = rate;
    };
    tunedVideos.forEach((video) => {
      tuneVideo(video);
      video.addEventListener("loadedmetadata", () => tuneVideo(video), { once: true });
    });
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.06, rootMargin: "0px 0px 8%" },
    );
    elements.forEach((element) => observer.observe(element));

    const smartVideos = document.querySelectorAll<HTMLVideoElement>("video[data-smart-video]");
    const videoObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          if (video.dataset.loaded !== "true") {
            video.dataset.loaded = "true";
            video.load();
          }
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      }),
      { threshold: 0.18, rootMargin: "20% 0px" },
    );
    smartVideos.forEach((video) => videoObserver.observe(video));

    const playSection = document.querySelector<HTMLElement>(".play-showcase");
    const historySection = document.querySelector<HTMLElement>(".history");
    const historyWindow = historySection?.querySelector<HTMLElement>(".timeline-window");
    const historyTrack = historySection?.querySelector<HTMLElement>(".timeline");
    const historyEntries = historySection?.querySelectorAll<HTMLElement>(".timeline article") || [];
    const pulse = document.querySelector<HTMLElement>(".story-pulse");
    const pulseLabel = pulse?.querySelector<HTMLElement>(".story-pulse-label");
    const stages = [
      ["inicio", "Inicio", "dark"],
      ["grupo", "El grupo", "light"],
      ["play", "Tiki Taka Play", "dark"],
      ["areas", "Áreas", "dark"],
      ["salones", "Salones", "red"],
      ["historia", "Historia", "light"],
      ["empleo", "Empleo", "light"],
      ["contacto", "Contacto", "dark"],
    ].map(([id, label, surface]) => ({ element: document.getElementById(id), id, label, surface }));
    const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const scroll = window.scrollY;
      document.documentElement.style.setProperty(
        "--page-progress",
        String(max > 0 ? Math.min(1, scroll / max) : 0),
      );
      document.documentElement.style.setProperty("--scroll-y", `${scroll}px`);
      document.body.classList.toggle("has-scrolled", scroll > 40);

      if (pulse) {
        const current = stages.reduce((selected, stage) => {
          if (stage.element && stage.element.getBoundingClientRect().top <= window.innerHeight * .55) return stage;
          return selected;
        }, stages[0]);
        pulse.dataset.stage = current.id;
        pulse.dataset.surface = current.surface;
        if (pulseLabel) pulseLabel.textContent = current.label;
      }

      if (!reducedMotion && playSection) {
        const rect = playSection.getBoundingClientRect();
        const range = Math.max(1, rect.height - window.innerHeight);
        const progress = clamp(-rect.top / range);
        const smooth = progress * progress * (3 - 2 * progress);
        const entry = clamp((window.innerHeight - rect.top) / (window.innerHeight * .8));
        const mobileScene = window.innerWidth <= 650;
        const orbitProgress = clamp((progress - (mobileScene ? .34 : .18)) / (mobileScene ? .54 : .67));
        const angle = (-2.7 + orbitProgress * Math.PI * 2.45);
        const radiusX = mobileScene ? 38 : 10.5 + Math.sin(orbitProgress * Math.PI) * 4.5;
        const radiusY = mobileScene ? 21 : 18 + Math.sin(orbitProgress * Math.PI) * 3;
        const cherryX = (mobileScene ? 50 : 74) + Math.cos(angle) * radiusX;
        const cherryY = (mobileScene ? 53 : 51) + Math.sin(angle) * radiusY;
        const cherryScale = mobileScene
          ? .52 + Math.sin(orbitProgress * Math.PI) * .58
          : .55 + Math.sin(clamp(progress / .82) * Math.PI) * .95;
        const cherryOpacity = mobileScene
          ? clamp((progress - .31) / .1) * (1 - clamp((progress - .91) / .07))
          : clamp(entry * 1.5) * (1 - clamp((progress - .84) / .13));
        playSection.style.setProperty("--play-progress", String(smooth));
        playSection.style.setProperty("--play-content-y", `${(1 - entry) * 54 - smooth * 12}px`);
        playSection.style.setProperty("--play-layer-a", `${-entry * window.innerHeight * .58 - smooth * 70}px`);
        playSection.style.setProperty("--play-layer-b", `${-entry * window.innerHeight * .44 - smooth * 46}px`);
        playSection.style.setProperty("--play-layer-c", `${-entry * window.innerHeight * .31 - smooth * 25}px`);
        playSection.style.setProperty("--play-cherry-x", `${cherryX}vw`);
        playSection.style.setProperty("--play-cherry-y", `${cherryY}vh`);
        playSection.style.setProperty("--play-cherry-scale", String(cherryScale));
        playSection.style.setProperty("--play-cherry-rotation", `${smooth * 1260}deg`);
        playSection.style.setProperty("--play-cherry-opacity", String(cherryOpacity));
        playSection.style.setProperty("--play-visual-scale", String(.9 + smooth * .1));
        playSection.dataset.phase = progress < (mobileScene ? .32 : .3) ? "one" : progress < (mobileScene ? .72 : .68) ? "two" : "three";
      }

      if (!reducedMotion && historySection && historyWindow && historyTrack) {
        const rect = historySection.getBoundingClientRect();
        const range = Math.max(1, rect.height - window.innerHeight);
        const progress = clamp(-rect.top / range);
        const travel = Math.max(0, historyTrack.scrollWidth - historyWindow.clientWidth);
        historySection.style.setProperty("--history-progress", String(progress));
        historySection.style.setProperty("--history-x", `${-travel * progress}px`);
        const currentIndex = Math.min(historyEntries.length - 1, Math.floor(progress * historyEntries.length));
        historyEntries.forEach((entry, index) => entry.classList.toggle("is-current", index === currentIndex));
      }

      if (!reducedMotion) {
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((element) => {
          const speed = Number(element.dataset.parallax || 0.05);
          element.style.setProperty("--parallax-y", `${scroll * speed}px`);
        });
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (reducedMotion) return;
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = anchor?.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;
      event.preventDefault();
      const headerOffset = document.body.classList.contains("has-scrolled") ? 74 : 84;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.history.pushState(null, "", hash);
      window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? "auto" : "smooth" });
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => {
      onScroll();
    };
    addEventListener("resize", onResize);
    addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("click", onAnchorClick);
    return () => {
      observer.disconnect();
      videoObserver.disconnect();
      window.clearTimeout(readyTimer);
      if (frame) cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onPointer);
      document.removeEventListener("click", onAnchorClick);
    };
  }, []);

  return <>
    <div className="brand-intro" aria-hidden="true">
      <div className="intro-wordmark">
        <img
          src="https://www.tikitaka.es/wp-content/uploads/2026/04/cropped-Logo-blanco-2-lineas-1.png"
          alt=""
        />
      </div>
      <div className="intro-subline"><i /> GAMES <b>+</b> PLAY <i /></div>
    </div>
    <div className="scroll-progress" aria-hidden="true" />
    <div className="story-pulse" data-stage="inicio" data-surface="dark" aria-hidden="true">
      <div className="story-pulse-track"><i /></div>
      <div className="story-pulse-node"><span /></div>
      <small className="story-pulse-label">Inicio</small>
    </div>
    <div className="pointer-glow" aria-hidden="true" />
  </>;
}
