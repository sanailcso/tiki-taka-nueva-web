import { MotionLayer } from "./motion";
import { HeroSlider } from "./hero-slider";
import { SalonMap } from "./salon-map";
import { SiteHeader } from "./site-header";
import type { SiteContent } from "./cms/types";
import type { CSSProperties } from "react";

function BrandName({ name = "Tiki Taka", play = false, suffix = "" }: { name?: string; play?: boolean; suffix?: string }) {
  return (
    <span className="brand-name">
      {name}{play && <span className="brand-play-word"> Play</span>}{suffix}
    </span>
  );
}

export function SitePage({ content, assetBase = "/" }: { content: SiteContent; assetBase?: string }) {
  const logo = content.identity.logoUrl;
  const playUrl = content.identity.playUrl;
  return (
    <main>
      <MotionLayer />
      <SiteHeader logo={logo} navigation={content.navigation} />

      <section className="hero" id="inicio">
        <HeroSlider slides={content.hero.slides} cycleSeconds={content.motion.heroCycleSeconds} />
        <div className="hero-shade" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-scan" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow"><span /> {content.hero.eyebrow}</p>
          <h1><span className="hero-rise">{content.hero.titleAccent}</span> <span className="hero-rise hero-rise-late">{content.hero.title}</span></h1>
          <p className="hero-copy">{content.hero.description}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#grupo"><span>{content.hero.primaryButton}</span><b>↗</b></a>
            <a className="button button-play" href="#play"><span>{content.hero.secondaryButton}</span><b>→</b></a>
          </div>
          <div className="brand-switch" aria-label="Las dos marcas del grupo">
            <span><i /> <BrandName name={content.identity.brandName} /> <small>Presencial</small></span>
            <b>+</b>
            <span className="brand-switch-play"><i /> <BrandName name={content.identity.brandName} play /> <small>Online</small></span>
          </div>
        </div>
        <div className="hero-vertical-word" aria-hidden="true">{content.hero.verticalWord}</div>
        <div className="hero-index" aria-hidden="true">
          <span>01</span><i /><small>{content.hero.indexLabel}</small>
        </div>
      </section>

      <section className="proof" aria-label="Tiki Taka en cifras" data-reveal>
        {content.proof.values.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
        <div className="proof-note"><span>{content.proof.note}</span></div>
      </section>

      <div className="kinetic-strip" aria-hidden="true">
        <div><span>OCIO PRESENCIAL</span><b>✦</b><span>ENTRETENIMIENTO ONLINE</span><b>✦</b><span>INNOVACIÓN</span><b>✦</b><span>CERCANÍA</span><b>✦</b><span>OCIO PRESENCIAL</span><b>✦</b><span>ENTRETENIMIENTO ONLINE</span><b>✦</b><span>INNOVACIÓN</span><b>✦</b><span>CERCANÍA</span><b>✦</b></div>
      </div>

      <section className="intro section-shell" id="grupo">
        <div className="section-kicker"><span>02</span><i /> {content.intro.kicker}</div>
        <div className="intro-grid" data-reveal>
          <h2>{content.intro.title}</h2>
          <div className="intro-copy">
            {content.intro.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <a className="text-link" href="#historia">{content.intro.linkLabel} <span>→</span></a>
          </div>
        </div>
        <div className="statement" aria-hidden="true">
          <div><span>Experiencia</span><b>•</b><span>Innovación</span><b>•</b><span>Servicio</span><b>•</b><span>Experiencia</span><b>•</b><span>Innovación</span><b>•</b><span>Servicio</span><b>•</b></div>
        </div>
      </section>

      <section className="play-showcase" id="play" style={{ height: `${content.motion.playSceneHeight}vh` }}>
        <div className="play-sticky">
          <div className="play-threshold" aria-hidden="true"><span /><span /><span /></div>
          <div className="play-grid" aria-hidden="true" />
          <div className="play-glow glow-one" aria-hidden="true" />
          <div className="play-glow glow-two" aria-hidden="true" />
          <div className="play-cherry" aria-hidden="true">
            <span><img src={`${assetBase}tikitaka-cherry.png`} alt="" /></span>
            <small>Del salón a tu pantalla</small>
          </div>
          <div className="play-scene-rail" aria-hidden="true">
            <span className="scene-one"><i />Presencial</span>
            <span className="scene-two"><i />Transición</span>
            <span className="scene-three"><i />Play</span>
          </div>
          <div className="section-shell play-layout">
            <div className="play-copy" data-reveal>
              <div className="section-kicker play-kicker"><span>03</span><i /> {content.play.kicker}</div>
              <div className="play-route" aria-hidden="true">
                <span>{content.play.routeFrom}</span><i /><strong>{content.play.routeTo}</strong>
              </div>
              <h2>{content.play.title} <em>{content.play.titleAccent}</em></h2>
              <p>{content.play.description}</p>
              <div className="play-tags" aria-label="Juegos disponibles">
                {content.play.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <div className="play-actions">
                <a className="button button-primary" href={playUrl} target="_blank" rel="noreferrer">{content.play.button} <b>↗</b></a>
                <small>{content.play.disclaimer}</small>
              </div>
            </div>
            <div className="play-visual" data-reveal="scale">
              <a className="play-motion" href={playUrl} target="_blank" rel="noreferrer" aria-label={content.play.button}>
                <video data-smart-video muted playsInline loop preload="none" poster={content.play.motionPoster} aria-hidden="true">
                  <source src={content.play.motionVideo} />
                </video>
                <span className="play-motion-shade" aria-hidden="true" />
                <span className="play-motion-cta"><small>JUEGA ONLINE</small><strong>{content.play.button} <b>↗</b></strong></span>
              </a>
              <i className="play-chip chip-live" aria-hidden="true">LIVE</i>
              <i className="play-chip chip-always" aria-hidden="true">24/7</i>
              <i className="play-chip chip-age" aria-hidden="true">+18</i>
            </div>
          </div>
          <div className="play-ticker" aria-hidden="true"><div>
            <span>SLOTS</span><b>✦</b><span>CASINO EN VIVO</span><b>✦</b><span>RULETA</span><b>✦</b><span>BLACKJACK</span><b>✦</b>
            <span>SLOTS</span><b>✦</b><span>CASINO EN VIVO</span><b>✦</b><span>RULETA</span><b>✦</b><span>BLACKJACK</span><b>✦</b>
          </div></div>
        </div>
      </section>

      <section className="areas" id="areas">
        <div className="section-shell">
          <div className="areas-heading">
            <div>
              <div className="section-kicker light"><span>04</span><i /> {content.areas.kicker}</div>
              <h2>{content.areas.title}</h2>
            </div>
            <p>{content.areas.description}</p>
          </div>
          <div className="business-grid" data-reveal>
            {content.areas.cards.map((card, index) => (
              <article key={card.title} className={`business-card card-reveal stack-${["one", "two", "three"][index] || "three"} ${index === 0 ? "featured" : ""}`}>
                <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
                {index === 0 && <div className="card-orbit" aria-hidden="true"><i /><i /><i /></div>}
                <div className="card-signal" aria-hidden="true">
                  <strong>{String(index + 1).padStart(2, "0")}</strong><span /><span /><span />
                </div>
                <div className="card-body">
                  <p>{card.eyebrow}</p><h3>{card.title}</h3><span>{card.description}</span>
                  {card.href && card.label && <a href={card.href} target={card.href.startsWith("http") ? "_blank" : undefined} rel={card.href.startsWith("http") ? "noreferrer" : undefined}>{card.label} <b>↗</b></a>}
                </div>
                <div className="card-foot" aria-hidden="true"><span>TIKI TAKA GAMES</span><i /><b>0{index + 1}</b></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="finder" id="salones">
        <div className="finder-copy" data-reveal>
          <div className="section-kicker light"><span>05</span><i /> {content.finder.kicker}</div>
          <h2>{content.finder.title}</h2>
          <p>{content.finder.description}</p>
          <div className="finder-stat">
            <strong>{content.finder.count}</strong>
            <span>{content.finder.countLabel}</span>
          </div>
          <a className="finder-directory" href={content.finder.directoryUrl} target="_blank" rel="noreferrer">{content.finder.directoryLabel} <b>↗</b></a>
        </div>
        <SalonMap salons={content.salons.length ? content.salons : undefined} />
      </section>

      <section
        className="history"
        id="historia"
        style={{ "--history-height": `${Math.max(215, 125 + content.history.entries.length * 38)}vh` } as CSSProperties}
      >
        <div className="history-sticky">
          <div className="section-shell history-shell">
            <div className="history-top" data-reveal>
              <div>
                <div className="section-kicker"><span>06</span><i /> {content.history.kicker}</div>
                <h2>{content.history.title}</h2>
              </div>
              <p>{content.history.description}</p>
            </div>
            <div className="history-progress" aria-hidden="true"><i /><span>DESLIZA PARA RECORRER NUESTRA HISTORIA</span></div>
            <div className="timeline-window" data-reveal>
              <div className="timeline">
                {content.history.entries.map((entry, index) => (
                  <article key={`${entry.date}-${entry.title}`} className={entry.active ? "active" : undefined}>
                    <span className="timeline-index">{String(index + 1).padStart(2, "0")}</span>
                    <b>{entry.date}</b><h3>{entry.title}</h3><p>{entry.description}</p>
                  </article>
                ))}
                <div className="timeline-end" aria-hidden="true"><img src={`${assetBase}tikitaka-cherry.png`} alt="" /><span>SEGUIMOS JUGANDO</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="commitment">
        <div className="commitment-mark" aria-hidden="true">18+</div>
        <div className="commitment-copy" data-reveal>
          <div className="section-kicker light"><span>07</span><i /> {content.commitment.kicker}</div>
          <h2>{content.commitment.title}</h2>
          <p>{content.commitment.description}</p>
          <a className="text-link light-link" href={content.commitment.url} target="_blank" rel="noreferrer">{content.commitment.label} <span>↗</span></a>
        </div>
      </section>

      <section className="join section-shell" id="empleo">
        <div className="join-panel" data-reveal>
          <div className="join-number" aria-hidden="true">TT</div>
          <div>
            <div className="section-kicker light"><span>08</span><i /> {content.jobs.kicker}</div>
            <h2>{content.jobs.title}</h2>
            <p>{content.jobs.description}</p>
          </div>
          <a className="button button-primary" href={content.jobs.url} target="_blank" rel="noreferrer">{content.jobs.button} <b>↗</b></a>
        </div>
      </section>

      <footer id="contacto">
        <div className="footer-signature" aria-hidden="true"><span>TIKI TAKA</span><img src={`${assetBase}tikitaka-cherry.png`} alt="" /><span>GAMES</span></div>
        <div className="footer-main">
          <div className="footer-brand">
            <img src={logo} alt="Tiki Taka Games" />
            <p>{content.footer.tagline}</p>
          </div>
          <div><h3>El grupo</h3><a href="#grupo">Quiénes somos</a><a href="#historia">Nuestra historia</a><a href="#empleo">Empleo</a></div>
          <div><h3>Áreas</h3><a href="#areas">Salones de juego</a><a href="https://tikitakamaquinasrecreativas.com/" target="_blank" rel="noreferrer">Terminales de hostelería</a><a href="#areas">Apuestas deportivas</a><a href={playUrl}><BrandName name={content.identity.brandName} play /></a></div>
          <div><h3>Contacto</h3><a href={`mailto:${content.footer.email}`}>{content.footer.email}</a><a href={`tel:${content.footer.phone.replace(/\s/g, "")}`}>{content.footer.phone}</a><p>{content.footer.address.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</p></div>
        </div>
        <div className="footer-bottom"><span>© 2026 <BrandName name={content.identity.brandName} /> Games</span><div><a href={content.footer.legalUrl} target="_blank" rel="noreferrer">Aviso legal</a><a href={content.footer.privacyUrl} target="_blank" rel="noreferrer">Privacidad</a><a href={content.footer.cookiesUrl} target="_blank" rel="noreferrer">Cookies</a><a href={content.footer.ethicsUrl} target="_blank" rel="noreferrer">Canal ético</a></div><strong>JUEGA CON RESPONSABILIDAD · +18</strong></div>
      </footer>
    </main>
  );
}
