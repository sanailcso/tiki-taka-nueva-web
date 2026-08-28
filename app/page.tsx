import { MotionLayer } from "./motion";
import { SalonMap } from "./salon-map";

const logo =
  "https://www.tikitaka.es/wp-content/uploads/2026/04/cropped-Logo-blanco-2-lineas-1.png";

function BrandName({ play = false, suffix = "" }: { play?: boolean; suffix?: string }) {
  return (
    <span className="brand-name">
      Tiki Taka{play && <span className="brand-play-word"> Play</span>}{suffix}
    </span>
  );
}

export default function Home() {
  return (
    <main>
      <MotionLayer />
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Tiki Taka Games, inicio">
          <img src={logo} alt="Tiki Taka Games" />
        </a>
        <nav className="desktop-nav" aria-label="Navegación principal">
          <a href="#grupo">El grupo</a>
          <a href="#areas">Áreas de negocio</a>
          <a className="nav-play" href="#play"><BrandName play /></a>
          <a href="#historia">Nuestra historia</a>
          <a href="#empleo">Empleo</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <a className="nav-cta" href="#salones">Encuentra tu salón</a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-media" data-parallax="0.055" role="img" aria-label="Nuevas fachadas de Tiki Taka y del salón de Elche">
          <div className="hero-image hero-image-hq-night" aria-hidden="true" />
          <div className="hero-image hero-image-elche" aria-hidden="true" />
          <div className="hero-image hero-image-hq-day" aria-hidden="true" />
        </div>
        <div className="hero-shade" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-scan" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow"><span /> Grupo <BrandName /> Games</p>
          <h1><span className="hero-rise">50 años</span> <span className="hero-rise hero-rise-late">creando experiencias de ocio</span></h1>
          <p className="hero-copy">
            Dos mundos, una misma forma de entender el ocio: <BrandName /> en espacios
            físicos y <BrandName play /> en el entorno online.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#grupo"><span>Conoce <BrandName /></span><b>↗</b></a>
            <a className="button button-play" href="#play"><span>Descubre <BrandName play /></span><b>→</b></a>
          </div>
          <div className="brand-switch" aria-label="Las dos marcas del grupo">
            <span><i /> <BrandName /> <small>Presencial</small></span>
            <b>+</b>
            <span className="brand-switch-play"><i /> <BrandName play /> <small>Online</small></span>
          </div>
        </div>
        <div className="hero-slides-progress" aria-hidden="true"><i /><i /><i /></div>
        <div className="hero-vertical-word" aria-hidden="true">PRESENCIAL · DIGITAL ·</div>
        <div className="hero-index" aria-hidden="true">
          <span>01</span><i /><small>Grupo empresarial de ocio</small>
        </div>
      </section>

      <section className="proof" aria-label="Tiki Taka en cifras" data-reveal>
        <div><strong>+50</strong><span>años de experiencia</span></div>
        <div><strong>+60</strong><span>salones de juego</span></div>
        <div><strong>2</strong><span>mundos conectados</span></div>
        <div className="proof-note"><span>Tradición que impulsa el futuro.</span></div>
      </section>

      <div className="kinetic-strip" aria-hidden="true">
        <div><span>OCIO PRESENCIAL</span><b>✦</b><span>ENTRETENIMIENTO ONLINE</span><b>✦</b><span>INNOVACIÓN</span><b>✦</b><span>CERCANÍA</span><b>✦</b><span>OCIO PRESENCIAL</span><b>✦</b><span>ENTRETENIMIENTO ONLINE</span><b>✦</b><span>INNOVACIÓN</span><b>✦</b><span>CERCANÍA</span><b>✦</b></div>
      </div>

      <section className="intro section-shell" id="grupo">
        <div className="section-kicker"><span>02</span><i /> El grupo</div>
        <div className="intro-grid" data-reveal>
          <h2>Mucho más que una empresa de juego.</h2>
          <div className="intro-copy">
            <p>
              <BrandName /> Games nació como una empresa familiar y hoy es un grupo
              empresarial que integra experiencia, tecnología y servicio en
              distintas áreas del sector del ocio.
            </p>
            <p>
              Crecemos manteniendo la cercanía que nos define: conocemos cada
              mercado, cuidamos cada espacio y evolucionamos junto a las personas.
            </p>
            <a className="text-link" href="#historia">Conoce nuestra historia <span>→</span></a>
          </div>
        </div>
        <div className="statement" aria-hidden="true">
          <div><span>Experiencia</span><b>•</b><span>Innovación</span><b>•</b><span>Servicio</span><b>•</b><span>Experiencia</span><b>•</b><span>Innovación</span><b>•</b><span>Servicio</span><b>•</b></div>
        </div>
      </section>

      <section className="play-showcase" id="play">
        <div className="play-grid" aria-hidden="true" />
        <div className="play-glow glow-one" aria-hidden="true" />
        <div className="play-glow glow-two" aria-hidden="true" />
        <div className="section-shell play-layout">
          <div className="play-copy" data-reveal>
            <div className="section-kicker play-kicker"><span>03</span><i /> El universo online</div>
            <img className="play-logo" src="tikitaka-play-logo.png" alt="Tiki Taka Play" />
            <h2>La experiencia <BrandName suffix="," /> también online.</h2>
            <p>
              La extensión online de Tiki Taka reúne slots, casino en vivo y juegos
              de mesa en un entorno regulado, ágil y accesible desde cualquier dispositivo.
            </p>
            <div className="play-tags" aria-label="Juegos disponibles">
              <span>Slots</span><span>Casino en vivo</span><span>Ruleta</span><span>Blackjack</span>
            </div>
            <div className="play-actions">
              <a className="button button-primary" href="https://www.tikitakaplay.es/" target="_blank" rel="noreferrer">Entrar en Tiki Taka Play <b>↗</b></a>
              <small>Solo para mayores de 18 años. Juega con responsabilidad.</small>
            </div>
          </div>
          <div className="play-visual" data-reveal="scale">
            <div className="orbit orbit-a" aria-hidden="true"><span>PLAY</span></div>
            <div className="orbit orbit-b" aria-hidden="true" />
            <a className="play-core" href="https://www.tikitakaplay.es/" target="_blank" rel="noreferrer" aria-label="Entrar en Tiki Taka Play">
              <small>CASINO</small><strong>PLAY</strong><span>ONLINE · EN DIRECTO</span>
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
      </section>

      <section className="areas" id="areas">
        <div className="section-shell">
          <div className="areas-heading">
            <div>
              <div className="section-kicker light"><span>04</span><i /> El mundo presencial</div>
              <h2><BrandName suffix=", " /><br />cerca de ti.</h2>
            </div>
            <p>
              Espacios de ocio, apuestas deportivas y soluciones para establecimientos,
              con una atención cercana y una identidad reconocible.
            </p>
          </div>
          <div className="business-grid" data-reveal>
            <article className="business-card featured card-reveal">
              <span className="card-number">01</span>
              <div className="card-orbit" aria-hidden="true"><i /><i /><i /></div>
              <div className="card-body">
                <p>Experiencia presencial</p>
                <h3>Salones de juego</h3>
                <span>Espacios actuales, atención cercana y entretenimiento para disfrutar del momento.</span>
                <a href="#salones" aria-label="Ir a salones de juego">Explorar <b>↗</b></a>
              </div>
            </article>
            <article className="business-card card-reveal">
              <span className="card-number">02</span>
              <div className="card-body">
                <p>Soluciones para negocios</p>
                <h3>Terminales de hostelería</h3>
                <span>Instalación, mantenimiento y acompañamiento para cada establecimiento.</span>
                <a href="https://tikitakamaquinasrecreativas.com/" target="_blank" rel="noreferrer">Visitar web <b>↗</b></a>
              </div>
            </article>
            <article className="business-card card-reveal">
              <span className="card-number">03</span>
              <div className="card-body">
                <p>Emoción deportiva</p>
                <h3>Apuestas deportivas</h3>
                <span>Una oferta integrada en nuestros espacios y adaptada a la evolución del sector.</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="finder" id="salones">
        <div className="finder-copy" data-reveal>
          <div className="section-kicker light"><span>05</span><i /> Nuestros salones</div>
          <h2>Tu <BrandName suffix=", " /><br />más cerca de ti.</h2>
          <p>
            Explora nuestra red de salones de una forma diferente. Pasa por cada
            punto para descubrir la ubicación y abrir las indicaciones para llegar.
          </p>
          <div className="finder-stat">
            <strong>68</strong>
            <span>ubicaciones conectadas<br />en cuatro territorios</span>
          </div>
          <a className="finder-directory" href="https://www.tikitaka.es/salones-de-juego/" target="_blank" rel="noreferrer">Ver directorio oficial <b>↗</b></a>
        </div>
        <SalonMap />
      </section>

      <section className="history section-shell" id="historia">
        <div className="history-top" data-reveal>
          <div>
            <div className="section-kicker"><span>06</span><i /> Nuestra historia</div>
            <h2>El futuro se construye con experiencia.</h2>
          </div>
          <p>
            Más de cinco décadas evolucionando sin perder el espíritu familiar
            con el que comenzó todo.
          </p>
        </div>
        <div className="timeline" data-reveal>
          <article><b>El origen</b><h3>Raíces familiares</h3><p>Más de cinco décadas de experiencia nacidas de la gestión cercana de máquinas recreativas y de juego.</p></article>
          <article><b>2019</b><h3><BrandName /> Games</h3><p>Las diferentes líneas de negocio se unifican bajo una misma marca para reforzar su identidad y posicionamiento.</p></article>
          <article><b>2025</b><h3><BrandName play /></h3><p>La experiencia del grupo da el salto al entorno digital con el lanzamiento de su plataforma de juego online.</p></article>
          <article className="active"><b>Hoy</b><h3>Presencial + digital</h3><p>Una red de 68 ubicaciones y una propuesta online que siguen creciendo bajo una misma visión de futuro.</p></article>
        </div>
      </section>

      <section className="commitment">
        <div className="commitment-mark" aria-hidden="true">18+</div>
        <div className="commitment-copy" data-reveal>
          <div className="section-kicker light"><span>07</span><i /> Nuestro compromiso</div>
          <h2>El ocio solo tiene sentido si es responsable.</h2>
          <p>
            Promovemos una experiencia segura, informada y exclusivamente para
            mayores de edad. La responsabilidad forma parte de nuestra manera de entender el sector.
          </p>
          <a className="text-link light-link" href="https://www.tikitaka.es/juego-responsable/el-juego-responsable-como-disfrutar-del-entretenimiento-sin-riesgos/" target="_blank" rel="noreferrer">Conoce nuestro compromiso <span>↗</span></a>
        </div>
      </section>

      <section className="join section-shell" id="empleo">
        <div className="join-panel" data-reveal>
          <div className="join-number" aria-hidden="true">TT</div>
          <div>
            <div className="section-kicker light"><span>08</span><i /> Personas</div>
            <h2>¿Quieres crecer con nosotros?</h2>
            <p>Buscamos personas con iniciativa, cercanía y ganas de construir el futuro de <BrandName />.</p>
          </div>
          <a className="button button-primary" href="https://empleo.tikitaka.es/" target="_blank" rel="noreferrer">Ver oportunidades <b>↗</b></a>
        </div>
      </section>

      <footer id="contacto">
        <div className="footer-main">
          <div className="footer-brand">
            <img src={logo} alt="Tiki Taka Games" />
            <p>Más de 50 años creando experiencias de ocio.</p>
          </div>
          <div><h3>El grupo</h3><a href="#grupo">Quiénes somos</a><a href="#historia">Nuestra historia</a><a href="#empleo">Empleo</a></div>
          <div><h3>Áreas</h3><a href="#areas">Salones de juego</a><a href="https://tikitakamaquinasrecreativas.com/" target="_blank" rel="noreferrer">Terminales de hostelería</a><a href="#areas">Apuestas deportivas</a><a href="https://tikitakaplay.es/"><BrandName play /></a></div>
          <div><h3>Contacto</h3><a href="mailto:info@tikitaka.es">info@tikitaka.es</a><a href="tel:+34968573201">+34 968 57 32 01</a><p>Av. Pinatar, 40<br />30730 San Javier, Murcia</p></div>
        </div>
        <div className="footer-bottom"><span>© 2026 <BrandName /> Games</span><div><a href="https://www.tikitaka.es/aviso-legal/" target="_blank" rel="noreferrer">Aviso legal</a><a href="https://www.tikitaka.es/politica-de-privacidad/" target="_blank" rel="noreferrer">Privacidad</a><a href="https://www.tikitaka.es/politica-de-privacidad/" target="_blank" rel="noreferrer">Cookies</a><a href="https://canal-etico.tikitaka.es/es/" target="_blank" rel="noreferrer">Canal ético</a></div><strong>JUEGA CON RESPONSABILIDAD · +18</strong></div>
      </footer>
    </main>
  );
}
