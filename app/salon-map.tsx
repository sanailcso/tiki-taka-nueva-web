"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

export type Region = "Murcia" | "Comunidad Valenciana" | "Castilla-La Mancha" | "Andalucía";
export type Salon = { name: string; region: Region; href: string; lat: number; lng: number };

const publicSalonNames: Record<string, string> = {
  "Alhama de Murcia · Centro": "Tiki Taka Alhama de Murcia",
  "Alhama de Murcia · II": "Tiki Taka Alhama 2",
  "Molina de Segura · I": "Tiki Taka Molina 1",
  "Molina de Segura · II": "Tiki Taka Molina 2",
  "Santomera · I": "Tiki Taka Santomera 1",
  "Santomera · II": "Tiki Taka Santomera 2",
  "Llíria · I": "Tiki Taka Llíria 1",
  "Llíria · II": "Tiki Taka Llíria 2",
  "Albacete · I": "Tiki Taka Albacete 1",
  "Albacete · II": "Tiki Taka Albacete 2",
  "Albacete · III": "Tiki Taka Albacete 3",
  "La Vall d'Uixó": "Tiki Taka Vall d'Uixó",
  "Riba-roja de Túria": "Tiki Taka Riba-Roja",
  "Tavernes de la Valldigna": "Tiki Taka Tavernes Blanques",
  "San Pedro del Pinatar": "Tiki Taka San Pedro",
  "Benimàmet": "Tiki Taka Benimamet",
  "Huércal-Overa": "Tiki Taka - Huércal Overa",
  "Sangonera": "Apuestas de Murcia - Tiki Taka Sangonera La Verde",
  "Los Alcázares": "Apuestas de Murcia - Tiki Taka Los Alcázares",
  "Águilas · Alegría": "Apuestasdemurcia.es - Alegría de la Huerta",
  "Águilas · El Puerto": "Apuestasdemurcia Salón El Puerto",
  "Águilas · Las Yucas": "Apuestasdemurcia - Las Yucas",
  "Águilas · Las Molinetas": "ApuestasdeMurcia.es - Sport Bar Las Molinetas",
};

export function getSalonDisplayName(name: string) {
  if (/^(Tiki Taka|Apuestas(?:de| de) ?Murcia)/i.test(name)) return name;
  return publicSalonNames[name] ?? `Tiki Taka ${name}`;
}

const salonData: Array<Omit<Salon, "lat" | "lng">> = [
  { name: "Alcantarilla", region: "Murcia", href: "https://maps.app.goo.gl/Naw5XAA4HSngbfJeA" },
  { name: "Alhama de Murcia · Centro", region: "Murcia", href: "https://maps.app.goo.gl/ZNuC3DQvFuou9mpi9" },
  { name: "Alhama de Murcia · II", region: "Murcia", href: "https://maps.app.goo.gl/i78PUWRDvEgq6xoi6" },
  { name: "Aljucer", region: "Murcia", href: "https://maps.app.goo.gl/Scm2LXifcShyhDFQ7" },
  { name: "Beniaján", region: "Murcia", href: "https://maps.app.goo.gl/uWstHixtBeQVAbTs9" },
  { name: "Beniel", region: "Murcia", href: "https://maps.app.goo.gl/penGU1xgf5vqAxuH7" },
  { name: "Cabezo de Torres", region: "Murcia", href: "https://maps.app.goo.gl/y4PAXFJnjfwj8SDi8" },
  { name: "Cartagena", region: "Murcia", href: "https://maps.app.goo.gl/BCm9MwnFB8uGDkwz7" },
  { name: "Cieza", region: "Murcia", href: "https://maps.app.goo.gl/ova5CXsWXCeHt8BE9" },
  { name: "Ciklos", region: "Murcia", href: "https://maps.app.goo.gl/Wa1LsjDLht4xUCFLA" },
  { name: "El Palmar", region: "Murcia", href: "https://maps.app.goo.gl/5y7vV1HNVxvswBUJ6" },
  { name: "El Raal", region: "Murcia", href: "https://maps.app.goo.gl/3nJKXztFLzNx92Fy6" },
  { name: "Fortuna", region: "Murcia", href: "https://maps.app.goo.gl/u5WLMWRMukFi3o1C9" },
  { name: "La Alberca", region: "Murcia", href: "https://maps.app.goo.gl/MF4scGdbo7zsLRbq7" },
  { name: "Librilla", region: "Murcia", href: "https://maps.app.goo.gl/BSKuwunhLEUL9UqY6" },
  { name: "Lo Pagán", region: "Murcia", href: "https://maps.app.goo.gl/tPYCNbqqX95duCk98" },
  { name: "Los Alcázares", region: "Murcia", href: "https://maps.app.goo.gl/PiwktErNuxQKKkB7A" },
  { name: "Molina de Segura · I", region: "Murcia", href: "https://maps.app.goo.gl/cBbum39gvPzzEBrU8" },
  { name: "Molina de Segura · II", region: "Murcia", href: "https://maps.app.goo.gl/EpfNLLcsxPV62KEh9" },
  { name: "Puente Tocinos", region: "Murcia", href: "https://maps.app.goo.gl/cSKh9xd9zQkJjrCi6" },
  { name: "Mazarrón", region: "Murcia", href: "https://maps.app.goo.gl/hhtfFZ7GafRLLUUx5" },
  { name: "Ronda Sur", region: "Murcia", href: "https://maps.app.goo.gl/1NSxMS5jV1eza3Zv7" },
  { name: "San Javier", region: "Murcia", href: "https://maps.app.goo.gl/ee7x4jqwb5kSCde67" },
  { name: "San Pedro del Pinatar", region: "Murcia", href: "https://maps.app.goo.gl/sHJM5tKACcRHtwHW7" },
  { name: "Sangonera", region: "Murcia", href: "https://maps.app.goo.gl/rpnxy1xe9prXMFGGA" },
  { name: "Santiago de la Ribera", region: "Murcia", href: "https://maps.app.goo.gl/aWahcYaakitx9KKSA" },
  { name: "Santomera · I", region: "Murcia", href: "https://maps.app.goo.gl/LgbUyHz6pJiqd2Nq8" },
  { name: "Santomera · II", region: "Murcia", href: "https://maps.app.goo.gl/vi1HpDoUWddr54586" },
  { name: "Torreagüera", region: "Murcia", href: "https://maps.app.goo.gl/EK5TDaPugByN3hTJ8" },
  { name: "Totana", region: "Murcia", href: "https://maps.app.goo.gl/NNe4bcUX7DvTmtxD7" },
  { name: "Águilas · Alegría", region: "Murcia", href: "https://maps.google.com/maps/dir//Apuestasdemurcia.es+-+Alegr%C3%ADa+de+la+Huerta+Cj%C3%B3n.+de+la+Huerta,+6+30880+%C3%81guilas+Murcia/@37.407768,-1.586064,16z" },
  { name: "Águilas · El Puerto", region: "Murcia", href: "https://maps.google.com/maps/dir//Apuestasdemurcia+Sal%C3%B3n+El+Puerto+P.%C2%BA+de+Isaac+Peral,+11+30880+%C3%81guilas+Murcia/@37.4045896,-1.5794117,15z" },
  { name: "Águilas · Las Yucas", region: "Murcia", href: "https://maps.google.com/maps/dir//Apuestasdemurcia+-+Las+Yucas+C.+Pintor+Rosales,+5+30880+%C3%81guilas+Murcia/@37.402459,-1.592166,16z" },
  { name: "Águilas · Las Molinetas", region: "Murcia", href: "https://maps.google.com/maps/dir//ApuestasdeMurcia.es+-+Sport+Bar+Las+Molinetas+C.+Murcia,+15+30880+%C3%81guilas+Murcia/@37.4111048,-1.5772367,16z" },
  { name: "Albatera", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/11Ugn1AQHCc3PKzS8" },
  { name: "Alfarp", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/wgE5UC9TTvbwAUfeA" },
  { name: "Alicante", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/BEQfhukJtYtac3Ez9" },
  { name: "Alzira", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/SKgiLrKKhpUMdRb8A" },
  { name: "Benijófar", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/RSRSpTxYwYf4TvuC6" },
  { name: "Cabo Roig", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/QbvKpMU8PGVkG1m77" },
  { name: "Carcaixent", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/uY5aty27RP8UPMMs9" },
  { name: "Ciudad Quesada", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/eXZKHUVrp5wRpvqV9" },
  { name: "Dénia", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/ssaX8to4qFegfFGL8" },
  { name: "Elche", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/XcZhULQu5cRJdg8R6" },
  { name: "Llíria · I", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/7jDKaP2Cbe1hLa6M6" },
  { name: "Llíria · II", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/pNR3ruRfikFkPLEaA" },
  { name: "Massanassa", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/Nm5dXmEZjmQqckXq6" },
  { name: "Ontinyent", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/V3xJk48EGREXcXSF6" },
  { name: "Paterna", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/b5Q6wyWQN1HNg3FX8" },
  { name: "Pedreguer", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/R9A7muMR2pSSH5NdA" },
  { name: "Pilar de la Horadada", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/yP2JJ7zdMvtUPiKP7" },
  { name: "Riba-roja de Túria", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/hAUPBwUMqvS9zD3H9" },
  { name: "Sagunto", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/7FazPziKTPh4HDpMA" },
  { name: "San Isidro", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/TgEVbFrKzmZMuJUK9" },
  { name: "Tavernes de la Valldigna", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/tbayqnbsm3r2T3wEA" },
  { name: "Torrent", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/63ZzJXi6AuYkUCkV7" },
  { name: "La Vall d'Uixó", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/2B1f2BkqDmDZz8Ku7" },
  { name: "Vila-real", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/fXfYkWtuMiSVke7w5" },
  { name: "Xàtiva", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/CwfFCt4C6J1n2LtF7" },
  { name: "Benimàmet", region: "Comunidad Valenciana", href: "https://maps.app.goo.gl/Aa4xwa3SjfKUqSjz9" },
  { name: "Albacete · I", region: "Castilla-La Mancha", href: "https://maps.app.goo.gl/pZjGRiVxuhUpsK3u5" },
  { name: "Albacete · II", region: "Castilla-La Mancha", href: "https://maps.app.goo.gl/eBkBDQEkmuf2ePt1A" },
  { name: "Albacete · III", region: "Castilla-La Mancha", href: "https://maps.app.goo.gl/9MSKLebMbZgEcJDE6" },
  { name: "Tomelloso", region: "Castilla-La Mancha", href: "https://maps.app.goo.gl/i3q6mjgF2ueXRpSk8" },
  { name: "Las Candelas", region: "Andalucía", href: "https://maps.app.goo.gl/e9MTaBrLtRzaFj4D8" },
  { name: "Vintage", region: "Andalucía", href: "https://maps.app.goo.gl/bZvQqnV4jPFxRCXL9" },
  { name: "Almanzora", region: "Andalucía", href: "https://maps.app.goo.gl/AQ7aqizXqe1xTdgQ7" },
  { name: "Huércal-Overa", region: "Andalucía", href: "https://maps.app.goo.gl/kU8EDMAqbjcCe7gN8" },
];

const coordinates: Record<string, [number, number]> = {
  "Alcantarilla": [37.969, -1.214], "Alhama de Murcia · Centro": [37.851, -1.425], "Alhama de Murcia · II": [37.853, -1.423], "Aljucer": [37.947, -1.161],
  "Beniaján": [37.983, -1.071], "Beniel": [38.047, -1.001], "Cabezo de Torres": [38.035, -1.143], "Cartagena": [37.625, -0.996], "Cieza": [38.239, -1.419],
  "Ciklos": [37.992, -1.13], "El Palmar": [37.941, -1.161], "El Raal": [38.03, -1.04], "Fortuna": [38.18, -1.125], "La Alberca": [37.936, -1.142],
  "Librilla": [37.886, -1.353], "Lo Pagán": [37.819, -0.788], "Los Alcázares": [37.744, -0.851], "Molina de Segura · I": [38.05, -1.21],
  "Molina de Segura · II": [38.053, -1.206], "Puente Tocinos": [37.985, -1.07], "Mazarrón": [37.599, -1.315], "Ronda Sur": [37.975, -1.13],
  "San Javier": [37.806, -0.837], "San Pedro del Pinatar": [37.835, -0.791], "Sangonera": [37.93, -1.21], "Santiago de la Ribera": [37.797, -0.807],
  "Santomera · I": [38.06, -1.05], "Santomera · II": [38.063, -1.047], "Torreagüera": [37.984, -1.052], "Totana": [37.768, -1.5],
  "Águilas · Alegría": [37.407768, -1.586064], "Águilas · El Puerto": [37.4045896, -1.5794117], "Águilas · Las Yucas": [37.402459, -1.592166],
  "Águilas · Las Molinetas": [37.4111048, -1.5772367], "Albatera": [38.18, -0.87], "Alfarp": [39.277, -0.56], "Alicante": [38.345, -0.49], "Alzira": [39.15, -0.44],
  "Benijófar": [38.08, -0.74], "Cabo Roig": [37.91, -0.74], "Carcaixent": [39.12, -0.45], "Ciudad Quesada": [38.06, -0.72], "Dénia": [38.84, 0.106],
  "Elche": [38.27, -0.7], "Llíria · I": [39.63, -0.6], "Llíria · II": [39.633, -0.596], "Massanassa": [39.41, -0.4], "Ontinyent": [38.82, -0.61],
  "Paterna": [39.5, -0.44], "Pedreguer": [38.79, 0.03], "Pilar de la Horadada": [37.865, -0.79], "Riba-roja de Túria": [39.545, -0.57],
  "Sagunto": [39.68, -0.28], "San Isidro": [38.17, -0.84], "Tavernes de la Valldigna": [39.07, -0.27], "Torrent": [39.44, -0.46],
  "La Vall d'Uixó": [39.82, -0.23], "Vila-real": [39.94, -0.1], "Xàtiva": [38.99, -0.52], "Benimàmet": [39.51, -0.43],
  "Albacete · I": [38.995, -1.86], "Albacete · II": [38.998, -1.856], "Albacete · III": [38.992, -1.853], "Tomelloso": [39.16, -3.02],
  "Las Candelas": [36.84, -2.46], "Vintage": [36.845, -2.45], "Almanzora": [37.35, -2.19], "Huércal-Overa": [37.39, -1.94],
};

export const DEFAULT_SALONS: Salon[] = salonData.map((salon) => ({ ...salon, lat: coordinates[salon.name][0], lng: coordinates[salon.name][1] }));
const regions: Array<{ value: Region | "Todos"; label: string }> = [
  { value: "Todos", label: "Todos" }, { value: "Murcia", label: "Murcia" }, { value: "Comunidad Valenciana", label: "C. Valenciana" },
  { value: "Castilla-La Mancha", label: "Castilla-La Mancha" }, { value: "Andalucía", label: "Andalucía" },
];

export function SalonMap({ salons = DEFAULT_SALONS }: { salons?: Salon[] }) {
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, LeafletMarker>());
  const filtersRef = useRef<HTMLDivElement>(null);
  const activeNameRef = useRef("");
  const [mapReady, setMapReady] = useState(false);
  const [mapZoom, setMapZoom] = useState(7);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "Todos">("Todos");
  const [active, setActive] = useState<Salon | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es");
    return salons.filter((salon) => (region === "Todos" || salon.region === region) && (!needle || `${getSalonDisplayName(salon.name)} ${salon.region}`.toLocaleLowerCase("es").includes(needle)));
  }, [query, region, salons]);
  const displayedActive = active && filtered.find((salon) => salon.name === active.name);

  useEffect(() => {
    let cancelled = false;
    async function setupMap() {
      if (!mapNodeRef.current || mapRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !mapNodeRef.current) return;
      const map = L.map(mapNodeRef.current, { zoomControl: false, scrollWheelZoom: false, attributionControl: true, minZoom: 5, maxZoom: 18 }).setView([38.35, -1.05], 7);
      L.control.zoom({ position: "topright" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        subdomains: "abc",
        maxZoom: 19,
      }).addTo(map);
      const markerLayer = L.layerGroup().addTo(map);
      map.on("zoomend", () => setMapZoom(map.getZoom()));
      mapRef.current = map;
      markerLayerRef.current = markerLayer;
      setMapReady(true);
    }
    setupMap();
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; markerLayerRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapReady || !markerLayerRef.current || !mapRef.current) return;
    let cancelled = false;
    async function renderMarkers() {
      const L = await import("leaflet");
      if (cancelled || !markerLayerRef.current || !mapRef.current) return;
      markerLayerRef.current.clearLayers();
      markersRef.current.clear();

      if (mapZoom <= 8 && filtered.length > 1) {
        const grouped = filtered.reduce((result, salon) => {
          (result[salon.region] ||= []).push(salon);
          return result;
        }, {} as Partial<Record<Region, Salon[]>>);
        Object.entries(grouped).forEach(([regionName, regionSalons]) => {
          if (!regionSalons?.length) return;
          const lat = regionSalons.reduce((sum, salon) => sum + salon.lat, 0) / regionSalons.length;
          const lng = regionSalons.reduce((sum, salon) => sum + salon.lng, 0) / regionSalons.length;
          const cluster = L.marker([lat, lng], {
            title: `${regionSalons.length} salones en ${regionName}`,
            icon: L.divIcon({ html: `<span>${regionSalons.length}</span><small>${regionName === "Comunidad Valenciana" ? "CV" : regionName === "Castilla-La Mancha" ? "CLM" : regionName.slice(0, 3)}</small>`, className: "tt-cluster", iconSize: [56, 56], iconAnchor: [28, 28] }),
          });
          cluster.on("click", () => {
            const bounds = L.latLngBounds(regionSalons.map((salon) => [salon.lat, salon.lng] as [number, number]));
            mapRef.current?.fitBounds(bounds, { padding: [55, 55], maxZoom: 11 });
          });
          markerLayerRef.current?.addLayer(cluster);
        });
        return;
      }

      filtered.forEach((salon) => {
        const marker = L.marker([salon.lat, salon.lng], {
          title: getSalonDisplayName(salon.name),
          icon: L.divIcon({ html: '<span class="tt-cherry"><i></i></span>', className: "tt-marker", iconSize: [32, 40], iconAnchor: [16, 35] }),
        });
        marker.on("click", () => setActive(salon));
        marker.on("mouseover", () => setActive(salon));
        markersRef.current.set(salon.name, marker);
        markerLayerRef.current?.addLayer(marker);
        marker.getElement()?.classList.toggle("is-active", salon.name === activeNameRef.current);
      });
    }
    renderMarkers();
    return () => { cancelled = true; };
  }, [filtered, mapReady, mapZoom]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !filtered.length) return;
    async function frameResults() {
      const L = await import("leaflet");
      if (!mapRef.current) return;
      const bounds = L.latLngBounds(filtered.map((salon) => [salon.lat, salon.lng] as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: [52, 52], maxZoom: filtered.length === 1 ? 14 : 11 });
    }
    frameResults();
  }, [filtered, mapReady]);

  useEffect(() => {
    if (mobileView !== "map") return;
    const timer = window.setTimeout(() => mapRef.current?.invalidateSize(), 80);
    return () => window.clearTimeout(timer);
  }, [mobileView]);

  useEffect(() => {
    activeNameRef.current = active?.name || "";
    markersRef.current.forEach((marker, name) => marker.getElement()?.classList.toggle("is-active", name === active?.name));
  }, [active]);

  const selectSalon = (salon: Salon, focusMap = false) => {
    setActive(salon);
    if (focusMap) setMobileView("map");
    mapRef.current?.flyTo([salon.lat, salon.lng], 14, { duration: .7 });
  };

  const locateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setMobileView("map");
      mapRef.current?.flyTo([coords.latitude, coords.longitude], 11, { duration: .8 });
    });
  };

  const scrollFilters = (direction: -1 | 1) => {
    filtersRef.current?.scrollBy({ left: direction * 190, behavior: "smooth" });
  };

  return (
    <div className="salon-map" data-reveal="scale">
      <div className="locator-mobile-toggle" role="group" aria-label="Vista del localizador">
        <button type="button" className={mobileView === "list" ? "active" : ""} onClick={() => setMobileView("list")}>Lista</button>
        <button type="button" className={mobileView === "map" ? "active" : ""} onClick={() => setMobileView("map")}>Mapa</button>
      </div>
      <div className={`locator-shell show-${mobileView}`}>
        <aside className="locator-panel">
          <div className="locator-panel-head">
            <span className="eyebrow">Red Tiki Taka</span>
            <h3>Elige tu salón</h3>
            <label className="locator-search">
              <span aria-hidden="true">⌕</span><span className="sr-only">Busca tu Tiki Taka</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca tu Tiki Taka" />
              {query && <button type="button" aria-label="Borrar búsqueda" onClick={() => setQuery("")}>×</button>}
            </label>
            <div className="locator-filter-nav">
              <button type="button" className="locator-filter-arrow" aria-label="Ver filtros anteriores" onClick={() => scrollFilters(-1)}>‹</button>
              <div className="locator-filters" ref={filtersRef} aria-label="Filtrar por comunidad">
                {regions.map((item) => <button type="button" key={item.value} className={region === item.value ? "active" : ""} onClick={() => setRegion(item.value)}>{item.label}</button>)}
              </div>
              <button type="button" className="locator-filter-arrow" aria-label="Ver más filtros" onClick={() => scrollFilters(1)}>›</button>
            </div>
            <div className="locator-count"><strong>{filtered.length}</strong><span>{filtered.length === 1 ? "salón encontrado" : "salones encontrados"}</span></div>
          </div>
          <div className="locator-list">
            {filtered.map((salon, index) => (
              <button type="button" key={`${salon.region}-${salon.name}`} className={`locator-item ${active?.name === salon.name ? "active" : ""}`}
                onMouseEnter={() => setActive(salon)} onFocus={() => setActive(salon)} onClick={() => selectSalon(salon, true)}>
                <span className="locator-item-number">{String(index + 1).padStart(2, "0")}</span>
                <span><strong>{getSalonDisplayName(salon.name)}</strong><small>{salon.region}</small></span><i aria-hidden="true">→</i>
              </button>
            ))}
            {!filtered.length && <div className="locator-empty"><strong>Sin coincidencias</strong><span>Prueba con otra localidad o comunidad.</span></div>}
          </div>
        </aside>
        <div className="locator-map-wrap">
          <div className="locator-map" ref={mapNodeRef} aria-label="Mapa interactivo de salones Tiki Taka" />
          <button type="button" className="locator-geolocate" onClick={locateMe}><span aria-hidden="true">⌖</span> Cerca de mí</button>
          <div className="locator-zoom-hint" aria-hidden="true">Usa + / − para ampliar</div>
          {displayedActive && <article className="locator-card" aria-live="polite">
            <div className="locator-card-brand"><span>tiki taka</span><i /></div>
            <p>Salón seleccionado</p><h3>{getSalonDisplayName(displayedActive.name)}</h3><span className="locator-card-region">⌖ {displayedActive.region}</span>
            <a href={displayedActive.href} target="_blank" rel="noreferrer">Cómo llegar <b>↗</b></a>
          </article>}
        </div>
      </div>
    </div>
  );
}
