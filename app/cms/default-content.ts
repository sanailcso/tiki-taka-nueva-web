import type { SiteContent } from "./types";

export const DEFAULT_SITE_CONTENT: SiteContent = {
  identity: {
    logoUrl: "https://www.tikitaka.es/wp-content/uploads/2026/04/cropped-Logo-blanco-2-lineas-1.png",
    brandName: "Tiki Taka",
    playUrl: "https://www.tikitakaplay.es/",
  },
  navigation: { group: "El grupo", areas: "Áreas de negocio", play: "Tiki Taka Play", history: "Nuestra historia", jobs: "Empleo", contact: "Contacto", salons: "Encuentra tu salón" },
  hero: {
    eyebrow: "Grupo Tiki Taka Games",
    titleAccent: "50 años",
    title: "creando experiencias de ocio",
    description: "Dos mundos, una misma forma de entender el ocio: Tiki Taka en espacios físicos y Tiki Taka Play en el entorno online.",
    primaryButton: "Conoce Tiki Taka",
    secondaryButton: "Descubre Tiki Taka Play",
    verticalWord: "PRESENCIAL · DIGITAL ·",
    indexLabel: "Grupo empresarial de ocio",
    slides: [
      { id: "hq-night", type: "image", src: "/hero-hq-night.jpg", alt: "Nueva sede Tiki Taka de noche" },
      { id: "elche", type: "image", src: "/hero-elche.jpg", alt: "Nuevo salón Tiki Taka en Elche" },
      { id: "hq-day", type: "image", src: "/hero-hq-day.jpg", alt: "Nueva sede Tiki Taka de día" },
      { id: "machines", type: "video", src: "/hero-machines.mp4", poster: "/hero-machines-poster.webp", alt: "Máquinas de juego Tiki Taka", playbackRate: 0.5 },
    ],
  },
  proof: { values: [{ value: "+50", label: "años de experiencia" }, { value: "+60", label: "salones de juego" }, { value: "2", label: "mundos conectados" }], note: "Tradición que impulsa el futuro." },
  intro: {
    kicker: "El grupo",
    title: "Mucho más que una empresa de juego.",
    paragraphs: [
      "Tiki Taka Games nació como una empresa familiar y hoy es un grupo empresarial que integra experiencia, tecnología y servicio en distintas áreas del sector del ocio.",
      "Crecemos manteniendo la cercanía que nos define: conocemos cada mercado, cuidamos cada espacio y evolucionamos junto a las personas.",
    ],
    linkLabel: "Conoce nuestra historia",
  },
  play: {
    kicker: "El universo online", routeFrom: "Modo presencial", routeTo: "Modo online", title: "La emoción", titleAccent: "cambia de pantalla.",
    description: "La extensión online de Tiki Taka reúne slots, casino en vivo y juegos de mesa en un entorno regulado, ágil y accesible desde cualquier dispositivo.",
    tags: ["Slots", "Casino en vivo", "Ruleta", "Blackjack"], button: "Entrar en Tiki Taka Play", disclaimer: "Solo para mayores de 18 años. Juega con responsabilidad.",
    motionVideo: "/tikitaka-motion.webm", motionPoster: "/tikitaka-motion-poster.webp",
  },
  areas: {
    kicker: "El mundo presencial", title: "Tiki Taka, cerca de ti.",
    description: "Espacios de ocio, apuestas deportivas y soluciones para establecimientos, con una atención cercana y una identidad reconocible.",
    cards: [
      { eyebrow: "Experiencia presencial", title: "Salones de juego", description: "Espacios actuales, atención cercana y entretenimiento para disfrutar del momento.", label: "Explorar", href: "#salones" },
      { eyebrow: "Soluciones para negocios", title: "Terminales de hostelería", description: "Instalación, mantenimiento y acompañamiento para cada establecimiento.", label: "Visitar web", href: "https://tikitakamaquinasrecreativas.com/" },
      { eyebrow: "Emoción deportiva", title: "Apuestas deportivas", description: "Una oferta integrada en nuestros espacios y adaptada a la evolución del sector." },
    ],
  },
  finder: { kicker: "Nuestros salones", title: "Tu Tiki Taka, más cerca de ti.", description: "Explora nuestra red de salones de una forma diferente. Pasa por cada punto para descubrir la ubicación y abrir las indicaciones para llegar.", count: "68", countLabel: "ubicaciones conectadas en cuatro territorios", directoryLabel: "Ver directorio oficial", directoryUrl: "https://www.tikitaka.es/salones-de-juego/" },
  history: {
    kicker: "Nuestra historia", title: "El futuro se construye con experiencia.", description: "Más de cinco décadas evolucionando sin perder el espíritu familiar con el que comenzó todo.",
    entries: [
      { date: "El origen", title: "Raíces familiares", description: "Más de cinco décadas de experiencia nacidas de la gestión cercana de máquinas recreativas y de juego." },
      { date: "2019", title: "Tiki Taka Games", description: "Las diferentes líneas de negocio se unifican bajo una misma marca para reforzar su identidad y posicionamiento." },
      { date: "2025", title: "Tiki Taka Play", description: "La experiencia del grupo da el salto al entorno digital con el lanzamiento de su plataforma de juego online." },
      { date: "Hoy", title: "Presencial + digital", description: "Una red de 68 ubicaciones y una propuesta online que siguen creciendo bajo una misma visión de futuro.", active: true },
    ],
  },
  commitment: { kicker: "Nuestro compromiso", title: "El ocio solo tiene sentido si es responsable.", description: "Promovemos una experiencia segura, informada y exclusivamente para mayores de edad. La responsabilidad forma parte de nuestra manera de entender el sector.", label: "Conoce nuestro compromiso", url: "https://www.tikitaka.es/juego-responsable/el-juego-responsable-como-disfrutar-del-entretenimiento-sin-riesgos/" },
  jobs: { kicker: "Personas", title: "¿Quieres crecer con nosotros?", description: "Buscamos personas con iniciativa, cercanía y ganas de construir el futuro de Tiki Taka.", button: "Ver oportunidades", url: "https://empleo.tikitaka.es/" },
  footer: { tagline: "Más de 50 años creando experiencias de ocio.", email: "info@tikitaka.es", phone: "+34 968 57 32 01", address: "Av. Pinatar, 40\n30730 San Javier, Murcia", legalUrl: "https://www.tikitaka.es/aviso-legal/", privacyUrl: "https://www.tikitaka.es/politica-de-privacidad/", cookiesUrl: "https://www.tikitaka.es/politica-de-privacidad/", ethicsUrl: "https://canal-etico.tikitaka.es/es/" },
  seo: { title: "Tiki Taka Games · Nueva web", description: "Tiki Taka Games: más de 50 años creando experiencias de ocio presencial y online." },
  motion: { heroCycleSeconds: 6, machinesPlaybackRate: 0.5, playSceneHeight: 190 },
  salons: [],
};
