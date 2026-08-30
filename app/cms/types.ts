export type HeroSlide = {
  id: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  playbackRate?: number;
};

export type SalonEntry = {
  name: string;
  region: "Murcia" | "Comunidad Valenciana" | "Castilla-La Mancha" | "Andalucía";
  href: string;
  lat: number;
  lng: number;
};

export type SiteContent = {
  identity: { logoUrl: string; brandName: string; playUrl: string };
  navigation: { group: string; areas: string; play: string; history: string; jobs: string; contact: string; salons: string };
  hero: {
    eyebrow: string;
    titleAccent: string;
    title: string;
    description: string;
    primaryButton: string;
    secondaryButton: string;
    verticalWord: string;
    indexLabel: string;
    slides: HeroSlide[];
  };
  proof: { values: Array<{ value: string; label: string }>; note: string };
  intro: { kicker: string; title: string; paragraphs: string[]; linkLabel: string };
  play: {
    kicker: string;
    routeFrom: string;
    routeTo: string;
    title: string;
    titleAccent: string;
    description: string;
    tags: string[];
    button: string;
    disclaimer: string;
    motionVideo: string;
    motionPoster: string;
  };
  areas: {
    kicker: string;
    title: string;
    description: string;
    cards: Array<{ eyebrow: string; title: string; description: string; label?: string; href?: string }>;
  };
  finder: { kicker: string; title: string; description: string; count: string; countLabel: string; directoryLabel: string; directoryUrl: string };
  history: { kicker: string; title: string; description: string; entries: Array<{ date: string; title: string; description: string; active?: boolean }> };
  commitment: { kicker: string; title: string; description: string; label: string; url: string };
  jobs: { kicker: string; title: string; description: string; button: string; url: string };
  footer: {
    tagline: string;
    email: string;
    phone: string;
    address: string;
    legalUrl: string;
    privacyUrl: string;
    cookiesUrl: string;
    ethicsUrl: string;
  };
  seo: { title: string; description: string };
  motion: { heroCycleSeconds: number; machinesPlaybackRate: number; playSceneHeight: number };
  salons: SalonEntry[];
};

export type ContentRevision = { id: string; version: number; createdAt: number; createdBy: string; action: string };
export type MediaAsset = { id: string; storageKey: string; filename: string; mimeType: string; size: number; altText: string; createdAt: number; createdBy: string; url: string };
