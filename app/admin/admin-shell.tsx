"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Activity, ArchiveRestore, BriefcaseBusiness, Building2, ChevronDown, ChevronUp, CircleGauge,
  ExternalLink, FileText, GalleryVerticalEnd, Globe2, History, ImageIcon, LayoutDashboard, Link2,
  KeyRound, Loader2, LogOut, MapPin, Menu, MonitorPlay, Plus, Save, Search, ShieldCheck, Sparkles,
  Trash2, Upload, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Toaster } from "@/components/ui/sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { DEFAULT_SALONS, getSalonDisplayName } from "../salon-map";
import {
  addCmsMediaUrl, logoutCms, publishCmsDraft, restoreCmsRevision, saveCmsDraft,
  updateCmsCredentials, uploadCmsMedia,
} from "../cms/supabase-cms";
import type { ContentRevision, MediaAsset, SiteContent } from "../cms/types";

type Initial = { content: SiteContent; version: number; updatedAt: number; publishedAt: number };
type Section = "overview" | "identity" | "hero" | "intro" | "play" | "areas" | "finder" | "history" | "commitment" | "jobs" | "footer" | "seo" | "motion" | "media" | "security" | "revisions";
const IMAGE_OPTIMIZE_THRESHOLD = 5 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const OPTIMIZABLE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MediaLibraryContext = createContext<MediaAsset[]>([]);

async function optimizeImageForUpload(file: File): Promise<File> {
  if (file.size <= IMAGE_OPTIMIZE_THRESHOLD || !OPTIMIZABLE_IMAGE_TYPES.has(file.type)) return file;
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("No se ha podido preparar esta imagen."));
      element.src = objectUrl;
    });
    const plans = [
      { dimension: 2200, quality: .84 }, { dimension: 1920, quality: .78 },
      { dimension: 1600, quality: .72 }, { dimension: 1400, quality: .66 },
      { dimension: 1200, quality: .60 }, { dimension: 1000, quality: .55 },
      { dimension: 800, quality: .50 },
    ];
    let chosen: Blob | null = null;
    for (const plan of plans) {
      const scale = Math.min(1, plan.dimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("El navegador no ha podido optimizar la imagen.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", plan.quality));
      if (!blob) continue;
      if (!chosen || blob.size < chosen.size) chosen = blob;
      if (blob.size <= IMAGE_OPTIMIZE_THRESHOLD) { chosen = blob; break; }
    }
    if (!chosen) throw new Error("El navegador no ha podido optimizar la imagen.");
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([chosen], name, { type: "image/webp", lastModified: Date.now() });
  } finally { URL.revokeObjectURL(objectUrl); }
}

const nav: Array<{ id: Section; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Resumen", icon: LayoutDashboard }, { id: "identity", label: "Identidad y menú", icon: GalleryVerticalEnd },
  { id: "hero", label: "Portada y slider", icon: MonitorPlay }, { id: "intro", label: "El grupo", icon: Building2 },
  { id: "play", label: "Tiki Taka Play", icon: Sparkles }, { id: "areas", label: "Áreas de negocio", icon: BriefcaseBusiness },
  { id: "finder", label: "Salones y mapa", icon: MapPin }, { id: "history", label: "Historia", icon: History },
  { id: "commitment", label: "Juego responsable", icon: Users }, { id: "jobs", label: "Empleo", icon: FileText },
  { id: "footer", label: "Contacto y enlaces", icon: Link2 }, { id: "seo", label: "SEO", icon: Globe2 },
  { id: "motion", label: "Animaciones", icon: Activity }, { id: "media", label: "Multimedia", icon: ImageIcon },
  { id: "security", label: "Usuario y seguridad", icon: ShieldCheck }, { id: "revisions", label: "Historial", icon: ArchiveRestore },
];

function Field({ label, value, onChange, type = "text", hint }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; hint?: string }) {
  const assets = useContext(MediaLibraryContext);
  const mediaKind = label === "URL o ruta" ? "all"
    : label === "Vídeo de la animación" ? "video"
      : ["URL del logo", "Póster del vídeo", "Póster de la animación"].includes(label) ? "image"
        : null;
  if (mediaKind && typeof value === "string") {
    return <MediaField label={label} value={value} onChange={onChange} assets={assets} kind={mediaKind} hint={hint} />;
  }
  return <label className="cms-field"><span>{label}</span><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />{hint && <small>{hint}</small>}</label>;
}

function MediaField({ label, value, onChange, assets, kind = "image", hint }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  assets: MediaAsset[];
  kind?: "image" | "video" | "all";
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const compatibleAssets = assets.filter((asset) => kind === "all" || asset.mimeType.startsWith(`${kind}/`));

  return <div className="cms-field cms-media-field">
    <span>{label}</span>
    <div className="cms-media-field-row">
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button type="button" variant="outline"><ImageIcon />Elegir multimedia</Button></DialogTrigger>
        <DialogContent className="cms-media-dialog">
          <DialogHeader>
            <DialogTitle>Elige un archivo de la biblioteca</DialogTitle>
            <DialogDescription>Al pulsarlo se añadirá directamente a este campo.</DialogDescription>
          </DialogHeader>
          {compatibleAssets.length ? <div className="cms-picker-grid">
            {compatibleAssets.map((asset) => <button
              type="button"
              className={asset.url === value ? "active" : ""}
              key={asset.id}
              onClick={() => { onChange(asset.url); setOpen(false); }}
            >
              {asset.mimeType.startsWith("image/")
                ? <img src={asset.url} alt={asset.altText || asset.filename} />
                : <video src={asset.url} muted playsInline preload="metadata" />}
              <span>{asset.filename}</span>
            </button>)}
          </div> : <div className="cms-picker-empty">
            <ImageIcon />
            <strong>No hay archivos compatibles</strong>
            <span>Añade primero una {kind === "video" ? "animación o vídeo" : "imagen"} desde Multimedia.</span>
          </div>}
        </DialogContent>
      </Dialog>
    </div>
    {hint && <small>{hint}</small>}
  </div>;
}

function AreaField({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <label className="cms-field"><span>{label}</span><Textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function SectionHead({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="cms-section-head"><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>;
}

export function AdminShell({ initial, revisions: initialRevisions, media: initialMedia, userName }: { initial: Initial; revisions: ContentRevision[]; media: MediaAsset[]; userName: string }) {
  const [content, setContent] = useState<SiteContent>(() => ({ ...initial.content, salons: initial.content.salons.length ? initial.content.salons : DEFAULT_SALONS }));
  const [section, setSection] = useState<Section>("overview");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<"save" | "publish" | "upload" | "url" | "restore" | "credentials" | "logout" | null>(null);
  const [version, setVersion] = useState(initial.version);
  const [updatedAt, setUpdatedAt] = useState(initial.updatedAt);
  const [publishedAt, setPublishedAt] = useState(initial.publishedAt);
  const [assets, setAssets] = useState(initialMedia);
  const [revisions, setRevisions] = useState(initialRevisions);
  const [salonQuery, setSalonQuery] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaKind, setMediaKind] = useState<"image" | "video">("image");
  const [security, setSecurity] = useState({ username: userName, currentPassword: "", newPassword: "", confirmPassword: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const mutate = (recipe: (draft: SiteContent) => void) => {
    setContent((current) => { const next = structuredClone(current); recipe(next); return next; });
    setDirty(true);
  };

  const save = async () => {
    setBusy("save");
    try {
      const result = await saveCmsDraft(content);
      setUpdatedAt(result.updatedAt); setDirty(false); toast.success("Borrador guardado");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar"); }
    finally { setBusy(null); }
  };

  const publish = async () => {
    setBusy("publish");
    try {
      if (dirty) await saveCmsDraft(content);
      const result = await publishCmsDraft();
      setVersion(result.version); setPublishedAt(result.publishedAt); setUpdatedAt(result.publishedAt); setDirty(false);
      setRevisions(result.revisions);
      toast.success(`Versión ${result.version} publicada`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo publicar"); }
    finally { setBusy(null); }
  };

  const upload = async () => {
    const selectedFile = fileRef.current?.files?.[0];
    if (!selectedFile) return toast.error("Selecciona un archivo");
    setBusy("upload");
    try {
      const file = await optimizeImageForUpload(selectedFile);
      if (file.size > MAX_UPLOAD_BYTES) throw new Error("El archivo supera el límite de 50 MB.");
      const asset = await uploadCmsMedia(file);
      setAssets((current) => [asset, ...current]); if (fileRef.current) fileRef.current.value = "";
      const optimized = file.size < selectedFile.size;
      toast.success(optimized ? `Imagen optimizada y subida (${(file.size / 1024 / 1024).toFixed(1)} MB)` : "Archivo añadido a la biblioteca");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo subir"); }
    finally { setBusy(null); }
  };

  const addFromUrl = async () => {
    if (!mediaUrl.trim()) return toast.error("Pega una URL de imagen o vídeo");
    setBusy("url");
    try {
      const asset = await addCmsMediaUrl(mediaUrl.trim(), mediaKind);
      setAssets((current) => [asset, ...current]); setMediaUrl("");
      toast.success("URL añadida a la biblioteca");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo añadir la URL"); }
    finally { setBusy(null); }
  };

  const restore = async (id: string) => {
    setBusy("restore");
    try {
      const result = await restoreCmsRevision(id);
      setContent({ ...result.content, salons: result.content.salons.length ? result.content.salons : DEFAULT_SALONS }); setUpdatedAt(result.updatedAt); setDirty(true);
      toast.success("Versión recuperada como borrador"); setSection("overview");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo recuperar"); }
    finally { setBusy(null); }
  };

  const logout = async () => {
    setBusy("logout");
    try { await logoutCms(); }
    finally { window.location.assign(adminUrl("login")); }
  };

  const updateCredentials = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (security.newPassword !== security.confirmPassword) return toast.error("Las nuevas contraseñas no coinciden");
    setBusy("credentials");
    try {
      await updateCmsCredentials(security);
      toast.success("Credenciales actualizadas. Inicia sesión de nuevo.");
      window.setTimeout(() => window.location.assign(adminUrl("login")), 700);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se han podido actualizar las credenciales.");
      setBusy(null);
    }
  };

  const filteredSalons = useMemo(() => content.salons.map((salon, index) => ({ salon, index })).filter(({ salon }) => `${getSalonDisplayName(salon.name)} ${salon.region}`.toLowerCase().includes(salonQuery.toLowerCase())), [content.salons, salonQuery]);

  function adminUrl(suffix = "") {
    if (typeof window === "undefined") return `/admin${suffix ? `/${suffix}` : ""}`;
    const marker = "/admin";
    const index = window.location.pathname.lastIndexOf(marker);
    const root = index >= 0 ? window.location.pathname.slice(0, index + marker.length) : marker;
    return `${root}${suffix ? `/${suffix}` : ""}`;
  }

  return <MediaLibraryContext.Provider value={assets}><SidebarProvider className="cms-root">
    <Sidebar variant="sidebar" collapsible="offcanvas" className="cms-sidebar">
      <SidebarHeader className="cms-sidebar-head"><div className="cms-mark">TT</div><div><strong>Backoffice</strong><span>Tiki Taka Games</span></div></SidebarHeader>
      <SidebarContent><SidebarGroup><SidebarGroupLabel>Contenido</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>
        {nav.map((item) => <SidebarMenuItem key={item.id}><SidebarMenuButton isActive={section === item.id} onClick={() => setSection(item.id)} tooltip={item.label}><item.icon /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}
      </SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent>
      <SidebarFooter className="cms-sidebar-footer"><div><span className="cms-avatar">{userName.slice(0, 1).toUpperCase()}</span><div><strong>{userName}</strong><small>Administrador</small></div></div><button type="button" onClick={logout} disabled={busy === "logout"} aria-label="Cerrar sesión">{busy === "logout" ? <Loader2 className="animate-spin" /> : <LogOut />}</button></SidebarFooter>
    </Sidebar>
    <SidebarInset className="cms-inset">
      <header className="cms-topbar"><div><SidebarTrigger><Menu /></SidebarTrigger><span className={`cms-status ${dirty ? "draft" : "saved"}`}><i />{dirty ? "Cambios sin guardar" : `Borrador guardado${version ? ` · v${version}` : ""}`}</span></div><div className="cms-actions"><Button variant="outline" asChild><a href={adminUrl("preview")} target="_blank">Vista previa <ExternalLink /></a></Button><Button variant="outline" onClick={save} disabled={Boolean(busy)}>{busy === "save" ? <Loader2 className="animate-spin" /> : <Save />}Guardar</Button><Button className="cms-publish" onClick={publish} disabled={Boolean(busy)}>{busy === "publish" ? <Loader2 className="animate-spin" /> : <Globe2 />}Publicar</Button></div></header>
      <main className="cms-main">{renderSection()}</main>
    </SidebarInset><Toaster position="top-right" richColors />
  </SidebarProvider></MediaLibraryContext.Provider>;

  function renderSection() {
    if (section === "overview") return <><SectionHead eyebrow="Panel de control" title="Todo lo importante, bajo control." description="Edita con tranquilidad, comprueba el resultado y publica solo cuando esté listo." /><div className="cms-metrics"><article><CircleGauge /><span>Estado público</span><strong>{version ? `Versión ${version}` : "Web actual"}</strong><small>{publishedAt ? new Date(publishedAt).toLocaleString("es-ES") : "Sin publicaciones desde el panel"}</small></article><article><Save /><span>Último borrador</span><strong>{dirty ? "Pendiente" : "Guardado"}</strong><small>{updatedAt ? new Date(updatedAt).toLocaleString("es-ES") : "Contenido inicial"}</small></article><article><ImageIcon /><span>Biblioteca</span><strong>{assets.length} archivos</strong><small>Imágenes y vídeos reutilizables</small></article></div><div className="cms-quick"><div><h2>Flujo de publicación</h2><p>Los cambios se guardan primero como borrador. La web pública no cambia hasta que pulses Publicar.</p></div><Button onClick={() => setSection("hero")}>Editar portada <MonitorPlay /></Button><Button variant="outline" onClick={() => setSection("media")}>Abrir multimedia <ImageIcon /></Button></div></>;

    if (section === "identity") return <><SectionHead eyebrow="Identidad" title="Marca y navegación" description="Logo, destino online y textos del menú principal." /><div className="cms-card cms-grid-2"><Field label="Nombre de marca" value={content.identity.brandName} onChange={(v) => mutate((d) => { d.identity.brandName = v; })} /><Field label="URL del logo" value={content.identity.logoUrl} onChange={(v) => mutate((d) => { d.identity.logoUrl = v; })} /><Field label="URL de Tiki Taka Play" value={content.identity.playUrl} onChange={(v) => mutate((d) => { d.identity.playUrl = v; })} /><Field label="El grupo" value={content.navigation.group} onChange={(v) => mutate((d) => { d.navigation.group = v; })} /><Field label="Áreas de negocio" value={content.navigation.areas} onChange={(v) => mutate((d) => { d.navigation.areas = v; })} /><Field label="Tiki Taka Play" value={content.navigation.play} onChange={(v) => mutate((d) => { d.navigation.play = v; })} /><Field label="Historia" value={content.navigation.history} onChange={(v) => mutate((d) => { d.navigation.history = v; })} /><Field label="Empleo" value={content.navigation.jobs} onChange={(v) => mutate((d) => { d.navigation.jobs = v; })} /><Field label="Contacto" value={content.navigation.contact} onChange={(v) => mutate((d) => { d.navigation.contact = v; })} /><Field label="Botón de salones" value={content.navigation.salons} onChange={(v) => mutate((d) => { d.navigation.salons = v; })} /></div></>;

    if (section === "hero") return <><SectionHead eyebrow="Portada" title="Primera impresión y slider" description="Controla el mensaje de entrada y las imágenes o vídeos que rotan detrás." /><div className="cms-card cms-grid-2"><Field label="Línea superior" value={content.hero.eyebrow} onChange={(v) => mutate((d) => { d.hero.eyebrow = v; })} /><Field label="Texto destacado" value={content.hero.titleAccent} onChange={(v) => mutate((d) => { d.hero.titleAccent = v; })} /><Field label="Titular" value={content.hero.title} onChange={(v) => mutate((d) => { d.hero.title = v; })} /><Field label="Botón principal" value={content.hero.primaryButton} onChange={(v) => mutate((d) => { d.hero.primaryButton = v; })} /><Field label="Botón Tiki Taka Play" value={content.hero.secondaryButton} onChange={(v) => mutate((d) => { d.hero.secondaryButton = v; })} /><AreaField label="Descripción" value={content.hero.description} onChange={(v) => mutate((d) => { d.hero.description = v; })} /></div><div className="cms-list-head"><div><h2>Diapositivas</h2><p>Admite imágenes y vídeos. Puedes usar rutas de la biblioteca multimedia.</p></div><Button onClick={() => mutate((d) => { d.hero.slides.push({ id: crypto.randomUUID(), type: "image", src: "", alt: "" }); })}><Plus />Añadir</Button></div><div className="cms-stack">{content.hero.slides.map((slide, index) => <article className="cms-card cms-repeater" key={slide.id}><div className="cms-repeater-head"><strong>{String(index + 1).padStart(2, "0")} · {slide.type === "image" ? "Imagen" : "Vídeo"}</strong><div><Button size="icon" variant="ghost" disabled={!index} onClick={() => mutate((d) => { [d.hero.slides[index - 1], d.hero.slides[index]] = [d.hero.slides[index], d.hero.slides[index - 1]]; })}><ChevronUp /></Button><Button size="icon" variant="ghost" disabled={index === content.hero.slides.length - 1} onClick={() => mutate((d) => { [d.hero.slides[index + 1], d.hero.slides[index]] = [d.hero.slides[index], d.hero.slides[index + 1]]; })}><ChevronDown /></Button><Button size="icon" variant="ghost" onClick={() => mutate((d) => { d.hero.slides.splice(index, 1); })}><Trash2 /></Button></div></div><div className="cms-grid-2"><label className="cms-field"><span>Tipo</span><select value={slide.type} onChange={(e) => mutate((d) => { d.hero.slides[index].type = e.target.value as "image" | "video"; })}><option value="image">Imagen</option><option value="video">Vídeo</option></select></label><Field label="URL o ruta" value={slide.src} onChange={(v) => mutate((d) => { d.hero.slides[index].src = v; })} /><Field label="Texto alternativo" value={slide.alt} onChange={(v) => mutate((d) => { d.hero.slides[index].alt = v; })} />{slide.type === "video" && <><Field label="Póster del vídeo" value={slide.poster || ""} onChange={(v) => mutate((d) => { d.hero.slides[index].poster = v; })} /><Field label="Velocidad" type="number" value={slide.playbackRate || 1} onChange={(v) => mutate((d) => { d.hero.slides[index].playbackRate = Number(v); })} /></>}</div></article>)}</div></>;

    if (section === "intro") return <><SectionHead eyebrow="Sección 02" title="El grupo" description="Mensaje corporativo que explica quién es Tiki Taka." /><div className="cms-card cms-grid-2"><Field label="Antetítulo" value={content.intro.kicker} onChange={(v) => mutate((d) => { d.intro.kicker = v; })} /><Field label="Titular" value={content.intro.title} onChange={(v) => mutate((d) => { d.intro.title = v; })} /><AreaField label="Primer párrafo" value={content.intro.paragraphs[0] || ""} onChange={(v) => mutate((d) => { d.intro.paragraphs[0] = v; })} /><AreaField label="Segundo párrafo" value={content.intro.paragraphs[1] || ""} onChange={(v) => mutate((d) => { d.intro.paragraphs[1] = v; })} /><Field label="Enlace" value={content.intro.linkLabel} onChange={(v) => mutate((d) => { d.intro.linkLabel = v; })} /></div></>;

    if (section === "play") return <><SectionHead eyebrow="Sección 03" title="Tiki Taka Play" description="Contenido y pieza audiovisual del universo online." /><div className="cms-card cms-grid-2"><Field label="Antetítulo" value={content.play.kicker} onChange={(v) => mutate((d) => { d.play.kicker = v; })} /><Field label="Titular" value={content.play.title} onChange={(v) => mutate((d) => { d.play.title = v; })} /><Field label="Titular destacado" value={content.play.titleAccent} onChange={(v) => mutate((d) => { d.play.titleAccent = v; })} /><Field label="Botón" value={content.play.button} onChange={(v) => mutate((d) => { d.play.button = v; })} /><AreaField label="Descripción" value={content.play.description} onChange={(v) => mutate((d) => { d.play.description = v; })} /><AreaField label="Aviso +18" value={content.play.disclaimer} onChange={(v) => mutate((d) => { d.play.disclaimer = v; })} /><Field label="Etiquetas, separadas por comas" value={content.play.tags.join(", ")} onChange={(v) => mutate((d) => { d.play.tags = v.split(",").map((tag) => tag.trim()).filter(Boolean); })} /><Field label="Vídeo de la animación" value={content.play.motionVideo} onChange={(v) => mutate((d) => { d.play.motionVideo = v; })} /><Field label="Póster de la animación" value={content.play.motionPoster} onChange={(v) => mutate((d) => { d.play.motionPoster = v; })} /></div></>;

    if (section === "areas") return <><SectionHead eyebrow="Sección 04" title="Áreas de negocio" description="Presentación de las líneas de actividad del grupo." /><div className="cms-card cms-grid-2"><Field label="Antetítulo" value={content.areas.kicker} onChange={(v) => mutate((d) => { d.areas.kicker = v; })} /><Field label="Titular" value={content.areas.title} onChange={(v) => mutate((d) => { d.areas.title = v; })} /><AreaField label="Descripción" value={content.areas.description} onChange={(v) => mutate((d) => { d.areas.description = v; })} /></div><div className="cms-stack">{content.areas.cards.map((card, index) => <article className="cms-card" key={index}><h2>Área {index + 1}</h2><div className="cms-grid-2"><Field label="Antetítulo" value={card.eyebrow} onChange={(v) => mutate((d) => { d.areas.cards[index].eyebrow = v; })} /><Field label="Título" value={card.title} onChange={(v) => mutate((d) => { d.areas.cards[index].title = v; })} /><AreaField label="Descripción" value={card.description} onChange={(v) => mutate((d) => { d.areas.cards[index].description = v; })} /><Field label="Texto del enlace" value={card.label || ""} onChange={(v) => mutate((d) => { d.areas.cards[index].label = v; })} /><Field label="Destino del enlace" value={card.href || ""} onChange={(v) => mutate((d) => { d.areas.cards[index].href = v; })} /><Field label="URL del logotipo" value={card.logoUrl || ""} onChange={(v) => mutate((d) => { d.areas.cards[index].logoUrl = v; })} /></div></article>)}</div></>;

    if (section === "finder") return <><SectionHead eyebrow="Sección 05" title="Salones y mapa" description="Edita la introducción y cada ubicación que aparece en el localizador." /><div className="cms-card cms-grid-2"><Field label="Antetítulo" value={content.finder.kicker} onChange={(v) => mutate((d) => { d.finder.kicker = v; })} /><Field label="Titular" value={content.finder.title} onChange={(v) => mutate((d) => { d.finder.title = v; })} /><AreaField label="Descripción" value={content.finder.description} onChange={(v) => mutate((d) => { d.finder.description = v; })} /><Field label="Cifra" value={content.finder.count} onChange={(v) => mutate((d) => { d.finder.count = v; })} /><Field label="Texto de la cifra" value={content.finder.countLabel} onChange={(v) => mutate((d) => { d.finder.countLabel = v; })} /><Field label="Directorio oficial" value={content.finder.directoryUrl} onChange={(v) => mutate((d) => { d.finder.directoryUrl = v; })} /></div><div className="cms-list-head"><div><h2>{content.salons.length} salones</h2><p>Usa en «Nombre» exactamente el nombre público que aparece en Google.</p></div><Button onClick={() => mutate((d) => { d.salons.unshift({ name: "Tiki Taka Nuevo salón", region: "Murcia", href: "", lat: 37.98, lng: -1.13 }); })}><Plus />Añadir salón</Button></div><label className="cms-search"><Search /><Input placeholder="Buscar salón" value={salonQuery} onChange={(e) => setSalonQuery(e.target.value)} /></label><div className="cms-stack">{filteredSalons.map(({ salon, index }) => <article className="cms-card cms-salon" key={`${salon.name}-${index}`}><div className="cms-repeater-head"><strong>{getSalonDisplayName(salon.name)}</strong><Button size="icon" variant="ghost" onClick={() => mutate((d) => { d.salons.splice(index, 1); })}><Trash2 /></Button></div><div className="cms-grid-3"><Field label="Nombre público en Google" value={getSalonDisplayName(salon.name)} onChange={(v) => mutate((d) => { d.salons[index].name = v; })} /><label className="cms-field"><span>Comunidad</span><select value={salon.region} onChange={(e) => mutate((d) => { d.salons[index].region = e.target.value as typeof salon.region; })}><option>Murcia</option><option>Comunidad Valenciana</option><option>Castilla-La Mancha</option><option>Andalucía</option></select></label><Field label="Enlace de Maps" value={salon.href} onChange={(v) => mutate((d) => { d.salons[index].href = v; })} /><Field label="Latitud" type="number" value={salon.lat} onChange={(v) => mutate((d) => { d.salons[index].lat = Number(v); })} /><Field label="Longitud" type="number" value={salon.lng} onChange={(v) => mutate((d) => { d.salons[index].lng = Number(v); })} /></div></article>)}</div></>;

    if (section === "history") return <><SectionHead eyebrow="Sección 06" title="Nuestra historia" description="Titular y hitos de la línea temporal." /><div className="cms-card cms-grid-2"><Field label="Antetítulo" value={content.history.kicker} onChange={(v) => mutate((d) => { d.history.kicker = v; })} /><Field label="Titular" value={content.history.title} onChange={(v) => mutate((d) => { d.history.title = v; })} /><AreaField label="Descripción" value={content.history.description} onChange={(v) => mutate((d) => { d.history.description = v; })} /></div><div className="cms-list-head"><h2>Hitos</h2><Button onClick={() => mutate((d) => { d.history.entries.push({ date: "Año", title: "Nuevo hito", description: "" }); })}><Plus />Añadir</Button></div><div className="cms-stack">{content.history.entries.map((entry, index) => <article className="cms-card" key={index}><div className="cms-repeater-head"><strong>Hito {index + 1}</strong><Button size="icon" variant="ghost" onClick={() => mutate((d) => { d.history.entries.splice(index, 1); })}><Trash2 /></Button></div><div className="cms-grid-2"><Field label="Fecha" value={entry.date} onChange={(v) => mutate((d) => { d.history.entries[index].date = v; })} /><Field label="Título" value={entry.title} onChange={(v) => mutate((d) => { d.history.entries[index].title = v; })} /><AreaField label="Descripción" value={entry.description} onChange={(v) => mutate((d) => { d.history.entries[index].description = v; })} /></div></article>)}</div></>;

    if (section === "commitment") return <><SectionHead eyebrow="Sección 07" title="Juego responsable" description="Mensaje legal y reputacional de la marca." /><div className="cms-card cms-grid-2"><Field label="Antetítulo" value={content.commitment.kicker} onChange={(v) => mutate((d) => { d.commitment.kicker = v; })} /><Field label="Titular" value={content.commitment.title} onChange={(v) => mutate((d) => { d.commitment.title = v; })} /><AreaField label="Descripción" value={content.commitment.description} onChange={(v) => mutate((d) => { d.commitment.description = v; })} /><Field label="Texto del enlace" value={content.commitment.label} onChange={(v) => mutate((d) => { d.commitment.label = v; })} /><Field label="Destino" value={content.commitment.url} onChange={(v) => mutate((d) => { d.commitment.url = v; })} /></div></>;

    if (section === "jobs") return <><SectionHead eyebrow="Sección 08" title="Empleo" description="Llamada a formar parte de Tiki Taka." /><div className="cms-card cms-grid-2"><Field label="Antetítulo" value={content.jobs.kicker} onChange={(v) => mutate((d) => { d.jobs.kicker = v; })} /><Field label="Titular" value={content.jobs.title} onChange={(v) => mutate((d) => { d.jobs.title = v; })} /><AreaField label="Descripción" value={content.jobs.description} onChange={(v) => mutate((d) => { d.jobs.description = v; })} /><Field label="Botón" value={content.jobs.button} onChange={(v) => mutate((d) => { d.jobs.button = v; })} /><Field label="Destino" value={content.jobs.url} onChange={(v) => mutate((d) => { d.jobs.url = v; })} /></div></>;

    if (section === "footer") return <><SectionHead eyebrow="Pie de página" title="Contacto y enlaces" description="Datos corporativos y destinos legales." /><div className="cms-card cms-grid-2"><Field label="Lema" value={content.footer.tagline} onChange={(v) => mutate((d) => { d.footer.tagline = v; })} /><Field label="Correo" value={content.footer.email} onChange={(v) => mutate((d) => { d.footer.email = v; })} /><Field label="Teléfono" value={content.footer.phone} onChange={(v) => mutate((d) => { d.footer.phone = v; })} /><AreaField label="Dirección" value={content.footer.address} onChange={(v) => mutate((d) => { d.footer.address = v; })} /><Field label="Aviso legal" value={content.footer.legalUrl} onChange={(v) => mutate((d) => { d.footer.legalUrl = v; })} /><Field label="Privacidad" value={content.footer.privacyUrl} onChange={(v) => mutate((d) => { d.footer.privacyUrl = v; })} /><Field label="Cookies" value={content.footer.cookiesUrl} onChange={(v) => mutate((d) => { d.footer.cookiesUrl = v; })} /><Field label="Canal ético" value={content.footer.ethicsUrl} onChange={(v) => mutate((d) => { d.footer.ethicsUrl = v; })} /></div></>;

    if (section === "seo") return <><SectionHead eyebrow="Buscadores" title="SEO básico" description="Define cómo se presenta la web en resultados de búsqueda y pestañas del navegador." /><div className="cms-card"><Field label="Título SEO" value={content.seo.title} onChange={(v) => mutate((d) => { d.seo.title = v; })} hint={`${content.seo.title.length}/60 caracteres recomendados`} /><AreaField label="Descripción SEO" value={content.seo.description} onChange={(v) => mutate((d) => { d.seo.description = v; })} /><div className="cms-serp"><small>Vista aproximada</small><strong>{content.seo.title}</strong><span>tikitaka.es</span><p>{content.seo.description}</p></div></div></>;

    if (section === "motion") return <><SectionHead eyebrow="Movimiento" title="Animaciones" description="Ajustes seguros para el ritmo de la portada y la sección online." /><div className="cms-card cms-motion"><label><span><strong>Duración de cada diapositiva</strong><small>{content.motion.heroCycleSeconds} segundos</small></span><Slider min={3} max={15} step={1} value={[content.motion.heroCycleSeconds]} onValueChange={([v]) => mutate((d) => { d.motion.heroCycleSeconds = v; })} /></label><label><span><strong>Velocidad del vídeo de máquinas</strong><small>{content.motion.machinesPlaybackRate.toFixed(1)}×</small></span><Slider min={0.1} max={1} step={0.1} value={[content.motion.machinesPlaybackRate]} onValueChange={([v]) => mutate((d) => { d.motion.machinesPlaybackRate = v; const video = d.hero.slides.find((slide) => slide.id === "machines"); if (video) video.playbackRate = v; })} /></label><label><span><strong>Recorrido visual de Tiki Taka Play</strong><small>{content.motion.playSceneHeight}vh</small></span><Slider min={120} max={160} step={10} value={[content.motion.playSceneHeight]} onValueChange={([v]) => mutate((d) => { d.motion.playSceneHeight = v; })} /></label></div></>;

    if (section === "security") return <>
      <SectionHead eyebrow="Acceso" title="Usuario y seguridad" description="Cambia el usuario o la contraseña del backoffice sin editar código ni volver a publicar la web." />
      <form className="cms-security" onSubmit={updateCredentials}>
        <div className="cms-security-intro">
          <span><ShieldCheck /></span>
          <div><h2>Credenciales del administrador</h2><p>El acceso está protegido por Supabase Auth. Al confirmar el cambio se cerrará esta sesión para que vuelvas a identificarte.</p></div>
        </div>
        <div className="cms-card cms-grid-2">
          <Field label="Nuevo usuario" value={security.username} onChange={(username) => setSecurity((current) => ({ ...current, username }))} hint="Entre 3 y 32 caracteres: letras, números, punto, guion o guion bajo." />
          <Field label="Contraseña actual" type="password" value={security.currentPassword} onChange={(currentPassword) => setSecurity((current) => ({ ...current, currentPassword }))} hint="Necesaria para autorizar cualquier cambio." />
          <Field label="Nueva contraseña" type="password" value={security.newPassword} onChange={(newPassword) => setSecurity((current) => ({ ...current, newPassword }))} hint="Déjala vacía si solo quieres cambiar el usuario. Mínimo 8 caracteres." />
          <Field label="Repetir nueva contraseña" type="password" value={security.confirmPassword} onChange={(confirmPassword) => setSecurity((current) => ({ ...current, confirmPassword }))} />
          <div className="cms-security-action"><div><KeyRound /><span><strong>Cambio protegido</strong><small>Después del cambio tendrás que iniciar sesión de nuevo.</small></span></div><Button type="submit" disabled={busy === "credentials"}>{busy === "credentials" ? <Loader2 className="animate-spin" /> : <ShieldCheck />}Actualizar acceso</Button></div>
        </div>
      </form>
    </>;

    if (section === "media") return <>
      <SectionHead eyebrow="Biblioteca" title="Imágenes y vídeos" description="Sube un archivo o añade una URL y reutiliza su ruta en la portada, Tiki Taka Play o cualquier otra sección." />
      <div className="cms-media-sources">
        <div className="cms-upload">
          <div><Upload /><span><strong>Subir desde el dispositivo</strong><small>Imágenes y vídeos hasta 50 MB · las imágenes grandes se optimizan automáticamente</small></span></div>
          <Input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm" />
          <Button onClick={upload} disabled={busy === "upload"}>{busy === "upload" ? <Loader2 className="animate-spin" /> : <Upload />}Subir archivo</Button>
        </div>
        <div className="cms-url-source">
          <div><Link2 /><span><strong>Añadir desde una URL</strong><small>Pega el enlace directo de una imagen o un vídeo</small></span></div>
          <div className="cms-url-controls">
            <select aria-label="Tipo de contenido" value={mediaKind} onChange={(event) => setMediaKind(event.target.value as "image" | "video")}><option value="image">Imagen</option><option value="video">Vídeo</option></select>
            <Input type="url" placeholder="https://ejemplo.com/imagen.webp" value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addFromUrl(); }} />
            <Button onClick={addFromUrl} disabled={busy === "url"}>{busy === "url" ? <Loader2 className="animate-spin" /> : <Plus />}Añadir URL</Button>
          </div>
          <small className="cms-url-note">La URL debe apuntar directamente al archivo. Si la web externa bloquea imágenes enlazadas, es preferible subir el archivo.</small>
        </div>
      </div>
      <div className="cms-media-grid">{assets.map((asset) => <article key={asset.id}>{asset.mimeType.startsWith("image/") ? <img src={asset.url} alt={asset.altText || asset.filename} /> : <video src={asset.url} muted preload="metadata" />}<div><strong>{asset.filename}</strong><small>{asset.size ? `${(asset.size / 1024 / 1024).toFixed(1)} MB` : "URL externa"}</small><button type="button" onClick={() => { navigator.clipboard.writeText(asset.url); toast.success("Ruta copiada"); }}>Copiar ruta</button></div></article>)}</div>
      {!assets.length && <div className="cms-empty"><ImageIcon /><h2>La biblioteca está vacía</h2><p>Sube un archivo o añade una URL para empezar.</p></div>}
    </>;

    return <><SectionHead eyebrow="Seguridad" title="Historial de publicaciones" description="Cada publicación crea una copia recuperable. Restaurar nunca modifica la web pública: primero vuelve como borrador." /><div className="cms-history">{revisions.map((revision) => <article key={revision.id}><span>v{revision.version}</span><div><strong>Publicada</strong><small>{new Date(revision.createdAt).toLocaleString("es-ES")}</small></div><Button variant="outline" onClick={() => restore(revision.id)} disabled={busy === "restore"}><ArchiveRestore />Recuperar como borrador</Button></article>)}</div>{!revisions.length && <div className="cms-empty"><History /><h2>Aún no hay versiones</h2><p>La primera aparecerá cuando publiques desde este panel.</p></div>}</>;
  }
}
