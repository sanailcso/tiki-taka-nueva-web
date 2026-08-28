"use client";

import { useEffect } from "react";

export function MotionLayer() {
  useEffect(() => {
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const introSeen = window.sessionStorage.getItem("tt-brand-intro-seen") === "1";
    const readyTimer = window.setTimeout(() => {
      document.body.classList.add("site-ready");
      window.sessionStorage.setItem("tt-brand-intro-seen", "1");
    }, reducedMotion || introSeen ? 0 : 1050);
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
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
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      observer.disconnect();
      window.clearTimeout(readyTimer);
      if (frame) cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      removeEventListener("pointermove", onPointer);
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
    <div className="pointer-glow" aria-hidden="true" />
  </>;
}
