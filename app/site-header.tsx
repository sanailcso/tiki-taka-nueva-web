"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteContent } from "./cms/types";

type SiteHeaderProps = {
  logo: string;
  navigation: SiteContent["navigation"];
};

const menuItems = (navigation: SiteContent["navigation"]) => [
  ["#grupo", navigation.group],
  ["#areas", navigation.areas],
  ["#play", navigation.play],
  ["#historia", navigation.history],
  ["#empleo", navigation.jobs],
  ["#contacto", navigation.contact],
] as const;

export function SiteHeader({ logo, navigation }: SiteHeaderProps) {
  const items = menuItems(navigation);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeMenu, menuOpen]);

  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Tiki Taka Games, inicio">
        <img src={logo} alt="Tiki Taka Games" width="1080" height="616" decoding="async" />
      </a>

      <nav className="desktop-nav" aria-label="Navegación principal">
        {items.map(([href, label]) => (
          <a key={href} className={href === "#play" ? "nav-play" : undefined} href={href}>{label}</a>
        ))}
      </nav>

      <a className="nav-cta" href="#salones">{navigation.salons}</a>

      <button
        ref={triggerRef}
        className="mobile-menu-trigger"
        type="button"
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}
      >
        <span /><span /><span />
      </button>

      {menuOpen && <>
        <button className="mobile-menu-overlay" type="button" aria-label="Cerrar menú" onClick={closeMenu} />
        <div className="mobile-menu-sheet" id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Navegación principal">
          <div className="mobile-menu-top">
            <img src={logo} alt="Tiki Taka Games" width="1080" height="616" decoding="async" />
            <button className="mobile-menu-close" type="button" aria-label="Cerrar menú" onClick={closeMenu} autoFocus>×</button>
          </div>
          <nav className="mobile-nav" aria-label="Navegación móvil">
            {items.map(([href, label], index) => (
              <a key={href} className={href === "#play" ? "mobile-nav-play" : undefined} href={href} onClick={closeMenu}>
                <small>{String(index + 1).padStart(2, "0")}</small><span>{label}</span><b>↗</b>
              </a>
            ))}
          </nav>
          <a className="mobile-menu-cta" href="#salones" onClick={closeMenu}>{navigation.salons} <b>↗</b></a>
          <p className="mobile-menu-signoff">Tiki Taka Games · Presencial + Online</p>
        </div>
      </>}
    </header>
  );
}
