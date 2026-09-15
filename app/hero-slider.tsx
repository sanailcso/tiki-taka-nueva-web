"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "./cms/types";

export function HeroSlider({ slides, cycleSeconds }: { slides: HeroSlide[]; cycleSeconds: number }) {
  const [active, setActive] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), cycleSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [cycleSeconds, slides.length]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(media);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    slides.forEach((slide, index) => {
      if (slide.type !== "video") return;
      const video = videoRefs.current.get(slide.id);
      if (!video) return;
      video.defaultPlaybackRate = slide.playbackRate || 1;
      video.playbackRate = slide.playbackRate || 1;
      if (index === active && isVisible) {
        if (video.dataset.loaded !== "true") {
          video.dataset.loaded = "true";
          video.load();
        }
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [active, isVisible, slides]);

  return (
    <>
      <div ref={mediaRef} className="hero-media" data-parallax="0.055">
        {slides.map((slide, index) => slide.type === "video" ? (
          <video
            key={slide.id}
            ref={(node) => { if (node) videoRefs.current.set(slide.id, node); else videoRefs.current.delete(slide.id); }}
            className={`hero-cms-slide hero-cms-video ${index === active ? "is-active" : ""}`}
            muted playsInline loop preload="none" poster={slide.poster} aria-hidden="true"
          >
            <source src={slide.src} media="(min-width: 901px)" />
            <track kind="captions" src="decorative-captions.vtt" srcLang="es" label="Sin audio" default />
          </video>
        ) : (
          <img
            key={slide.id}
            className={`hero-cms-slide ${index === active ? "is-active" : ""}`}
            src={slide.src}
            alt={slide.alt}
            width="1600"
            height="900"
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
          />
        ))}
      </div>
      <div className="hero-slides-progress" aria-label="Imágenes de portada">
        {slides.map((slide, index) => (
          <button key={slide.id} type="button" className={index === active ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`Ver ${slide.type === "video" ? "vídeo" : "imagen"} ${index + 1}`}>
            <i style={{ animationDuration: `${cycleSeconds}s` }} />
          </button>
        ))}
      </div>
    </>
  );
}
