"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Hotel } from "@/lib/amadeus";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY ?? "";
const MAP_STYLE = `https://api.maptiler.com/maps/019e69f3-cd46-753f-a7c4-d5924682d95e/style.json?key=${MAPTILER_KEY}`;

function createPriceHTML(price: number | null, selected: boolean, hovered = false) {
  const bg = selected || hovered ? "#E8644A" : "#1E1E2E";
  const scale = selected ? "scale(1.18)" : hovered ? "scale(1.22)" : "scale(1)";
  const shadow = hovered || selected
    ? "0 4px 16px rgba(232,100,74,0.45)"
    : "0 2px 8px rgba(0,0,0,0.25)";
  const label = price ? `${price} €` : "?";
  return `<div style="
    background: ${bg};
    color: #fff;
    border-radius: 20px;
    padding: 5px 10px;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    box-shadow: ${shadow};
    border: 2px solid #fff;
    transform: ${scale};
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    cursor: pointer;
    transition: transform 0.15s, background 0.15s, box-shadow 0.15s;
  ">${label}</div>`;
}

function createStopMarkerHTML(label: string, pulsing: boolean) {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;user-select:none">
      <div style="
        background:#E8644A;color:#fff;
        font-size:12px;font-weight:800;
        padding:5px 13px;border-radius:10px;
        white-space:nowrap;
        box-shadow:0 3px 16px rgba(232,100,74,0.55);
        font-family:'Segoe UI',system-ui,-apple-system,sans-serif;
        margin-bottom:3px;
        letter-spacing:0.02em;
      ">${label}</div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #E8644A;margin-bottom:2px"></div>
      <div style="position:relative;width:14px;height:14px">
        ${pulsing ? `
          <div style="
            position:absolute;inset:-6px;
            border-radius:50%;
            background:rgba(232,100,74,0.25);
            animation:kw-pulse 1.6s ease-out infinite;
          "></div>
        ` : ""}
        <div style="
          position:relative;
          width:14px;height:14px;border-radius:50%;
          background:#E8644A;border:2.5px solid #fff;
          box-shadow:0 0 0 3px rgba(232,100,74,0.35);
        "></div>
      </div>
    </div>
  `;
}

interface MapViewProps {
  route: { type: string; coordinates: [number, number][] } | null;
  hotels: Hotel[];
  origin: { name: string; lat: number; lng: number } | null;
  destination: { name: string; lat: number; lng: number } | null;
  selectedHotelId: string | null;
  hoveredHotelId?: string | null;
  onSelectHotel: (id: string) => void;
  onExpandHotel: (id: string) => void;
  // Point d'étape — synchronisation map ↔ timeline
  stopPct: number | null;
  waypoints: Array<{ lat: number; lng: number }>;
  onRouteClick: (pct: number) => void;
  getTimeAtPct: (pct: number) => string;
  stopPinPulsing?: boolean;
  flyToStop?: { lat: number; lng: number } | null;
}

export default function MapView({
  route, hotels, origin, destination, selectedHotelId, hoveredHotelId,
  onSelectHotel, onExpandHotel,
  stopPct, waypoints, onRouteClick, getTimeAtPct, stopPinPulsing = false,
  flyToStop,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const popupsRef = useRef<Map<string, maplibregl.Popup>>(new Map());
  const stopMarkerRef = useRef<maplibregl.Marker | null>(null);
  const routeHoverPopupRef = useRef<maplibregl.Popup | null>(null);

  // Stable refs for callbacks
  const onSelectRef = useRef(onSelectHotel);
  const onExpandRef = useRef(onExpandHotel);
  const onRouteClickRef = useRef(onRouteClick);
  const getTimeAtPctRef = useRef(getTimeAtPct);
  const waypointsRef = useRef(waypoints);
  const routeRef = useRef(route);
  useEffect(() => { onSelectRef.current = onSelectHotel; }, [onSelectHotel]);
  useEffect(() => { onExpandRef.current = onExpandHotel; }, [onExpandHotel]);
  useEffect(() => { onRouteClickRef.current = onRouteClick; }, [onRouteClick]);
  useEffect(() => { getTimeAtPctRef.current = getTimeAtPct; }, [getTimeAtPct]);
  useEffect(() => { waypointsRef.current = waypoints; }, [waypoints]);
  useEffect(() => { routeRef.current = route; }, [route]);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [2.5, 46.5],
      zoom: 5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-left");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    // Popup réutilisable pour le hover route
    const hoverPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      closeOnMove: false,
      offset: [0, -8],
      maxWidth: "none",
    });
    routeHoverPopupRef.current = hoverPopup;

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });

      // Halo blanc
      map.addLayer({
        id: "route-line-halo", type: "line", source: "route",
        paint: { "line-color": "#ffffff", "line-width": 11, "line-opacity": 0.6 },
        layout: { "line-cap": "round", "line-join": "round" },
      });
      // Ligne orange principale
      map.addLayer({
        id: "route-line", type: "line", source: "route",
        paint: { "line-color": "#E8644A", "line-width": 7, "line-opacity": 1 },
        layout: { "line-cap": "round", "line-join": "round" },
      });
      // Zone de hit invisible — plus large pour faciliter le clic
      map.addLayer({
        id: "route-line-hit", type: "line", source: "route",
        paint: { "line-color": "#E8644A", "line-width": 28, "line-opacity": 0.001 },
        layout: { "line-cap": "round", "line-join": "round" },
      });

      // Curseur sur hover de la route
      map.on("mouseenter", "route-line-hit", () => {
        map.getCanvas().style.cursor = "crosshair";
      });
      map.on("mouseleave", "route-line-hit", () => {
        map.getCanvas().style.cursor = "";
        hoverPopup.remove();
      });

      // pct par distance cumulée (pas par index) — les coords ne sont pas équidistantes
      function coordPct(coords: [number, number][], clickLng: number, clickLat: number): number {
        let minD = Infinity, minIdx = 0;
        coords.forEach(([cLng, cLat], i) => {
          const d = (cLng - clickLng) ** 2 + (cLat - clickLat) ** 2;
          if (d < minD) { minD = d; minIdx = i; }
        });
        let totalDist = 0, distToMin = 0;
        for (let i = 1; i < coords.length; i++) {
          const dx = coords[i][0] - coords[i - 1][0];
          const dy = coords[i][1] - coords[i - 1][1];
          const seg = Math.sqrt(dx * dx + dy * dy);
          if (i <= minIdx) distToMin += seg;
          totalDist += seg;
        }
        return Math.max(2, Math.min(98, Math.round((distToMin / (totalDist || 1)) * 100)));
      }

      // Tooltip temps au survol de la route
      map.on("mousemove", "route-line-hit", (e) => {
        const coords = routeRef.current?.coordinates;
        if (!coords?.length) return;
        const pct = coordPct(coords, e.lngLat.lng, e.lngLat.lat);
        const timeLabel = getTimeAtPctRef.current(pct);
        hoverPopup
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="
              background:#1E1E2E;color:#fff;
              font-size:12px;font-weight:800;
              padding:6px 13px;border-radius:10px;
              white-space:nowrap;
              font-family:'Segoe UI',system-ui,-apple-system,sans-serif;
              box-shadow:0 3px 10px rgba(0,0,0,0.3);
              letter-spacing:0.02em;
            ">
              🛏 Faire étape à <strong style="color:#F09070">${timeLabel}</strong>
            </div>
          `)
          .addTo(map);
      });

      // Clic sur la route → placer l'étape
      map.on("click", "route-line-hit", (e) => {
        const coords = routeRef.current?.coordinates;
        if (!coords?.length) return;
        const pct = coordPct(coords, e.lngLat.lng, e.lngLat.lat);
        hoverPopup.remove();
        onRouteClickRef.current(pct);
        e.preventDefault();
      });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update route source
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    function applyRoute() {
      const src = map!.getSource("route") as maplibregl.GeoJSONSource | undefined;
      if (!src) return;
      src.setData({
        type: "Feature", properties: {},
        geometry: { type: "LineString", coordinates: route?.coordinates ?? [] },
      });
    }
    if (map.isStyleLoaded()) applyRoute();
    else map.once("load", applyRoute);
  }, [route]);

  // Fit bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (route && route.coordinates.length > 0) {
      const lngs = route.coordinates.map(([lng]) => lng);
      const lats = route.coordinates.map(([, lat]) => lat);
      map.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 60, duration: 600 }
      );
    } else if (origin && destination) {
      map.fitBounds(
        [[Math.min(origin.lng, destination.lng), Math.min(origin.lat, destination.lat)],
         [Math.max(origin.lng, destination.lng), Math.max(origin.lat, destination.lat)]],
        { padding: 60 }
      );
    }
  }, [route, origin, destination]);

  // Origin/destination markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (origin) {
      const el = document.createElement("div");
      el.style.cssText = "width:14px;height:14px;border-radius:50%;background:#E8644A;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)";
      new maplibregl.Marker({ element: el }).setLngLat([origin.lng, origin.lat])
        .setPopup(new maplibregl.Popup({ offset: 20 }).setText(origin.name.split(",")[0]))
        .addTo(map);
    }
    if (destination) {
      const el = document.createElement("div");
      el.style.cssText = "width:14px;height:14px;border-radius:50%;background:#06D6A0;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)";
      new maplibregl.Marker({ element: el }).setLngLat([destination.lng, destination.lat])
        .setPopup(new maplibregl.Popup({ offset: 20 }).setText(destination.name.split(",")[0]))
        .addTo(map);
    }
  }, [origin, destination]);

  // ── Pin d'étape sur la carte — synchronisé avec stopPct ──────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (stopPct === null) {
      stopMarkerRef.current?.remove();
      stopMarkerRef.current = null;
      return;
    }

    // Positionner sur la polyline exacte (distance cumulée) — pas sur les waypoints grossiers
    const coords = routeRef.current?.coordinates;
    let lat: number, lng: number;
    if (coords?.length) {
      let totalDist = 0;
      const segs: number[] = [0];
      for (let i = 1; i < coords.length; i++) {
        const dx = coords[i][0] - coords[i - 1][0];
        const dy = coords[i][1] - coords[i - 1][1];
        totalDist += Math.sqrt(dx * dx + dy * dy);
        segs.push(totalDist);
      }
      const target = (stopPct / 100) * totalDist;
      let i = segs.findIndex((d) => d >= target);
      if (i <= 0) i = 1;
      const segLen = segs[i] - segs[i - 1];
      const t = segLen > 0 ? (target - segs[i - 1]) / segLen : 0;
      lng = coords[i - 1][0] + t * (coords[i][0] - coords[i - 1][0]);
      lat = coords[i - 1][1] + t * (coords[i][1] - coords[i - 1][1]);
    } else if (waypoints.length) {
      const idx = Math.min(waypoints.length - 1, Math.floor((stopPct / 100) * waypoints.length));
      lat = waypoints[idx].lat;
      lng = waypoints[idx].lng;
    } else {
      return;
    }
    const label = getTimeAtPct(stopPct);

    if (stopMarkerRef.current) {
      // Mise à jour position + contenu
      stopMarkerRef.current.setLngLat([lng, lat]);
      stopMarkerRef.current.getElement().innerHTML = createStopMarkerHTML(label, stopPinPulsing);
    } else {
      const el = document.createElement("div");
      el.innerHTML = createStopMarkerHTML(label, stopPinPulsing);
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([lng, lat])
        .addTo(map);
      stopMarkerRef.current = marker;
    }
  }, [stopPct, waypoints, stopPinPulsing, getTimeAtPct]);

  // ── Hotel markers ──────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    popupsRef.current.forEach((p) => p.remove());
    markersRef.current.clear();
    popupsRef.current.clear();

    hotels.forEach((hotel) => {
      const el = document.createElement("div");
      el.innerHTML = createPriceHTML(hotel.pricePerNight, false);

      const popup = new maplibregl.Popup({
        offset: [0, -8], maxWidth: "300px",
        closeOnMove: false, closeButton: false, closeOnClick: false,
      }).setHTML(`
        <div class="kw-popup-card" style="width:260px;font-family:system-ui,sans-serif;position:relative;border-radius:18px;overflow:hidden;background:rgba(255,255,255,0.72);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);">
          <!-- Photo -->
          <div style="width:100%;height:148px;overflow:hidden;position:relative">
            <img src="${hotel.imageUrl}" style="width:100%;height:100%;object-fit:cover;display:block"
              onerror="this.src='https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop'"/>
            <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0) 50%,rgba(0,0,0,0.28) 100%)"></div>
          </div>
          <!-- Croix — visible au hover via CSS -->
          <button
            class="kw-close-btn"
            onclick="window.__kipwayClose('${hotel.id}')"
            style="position:absolute;top:10px;right:10px;width:26px;height:26px;border-radius:50%;background:rgba(0,0,0,0.45);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:none;cursor:pointer;color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.15s,background 0.15s;line-height:1;padding:0"
          >✕</button>
          <!-- Infos -->
          <div style="padding:12px 14px 14px">
            <div style="font-weight:800;font-size:14px;color:#1E1E2E;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:'Nunito',system-ui,sans-serif">${hotel.name}</div>
            <div style="font-size:11px;color:#6B7280;margin-bottom:10px;display:flex;gap:6px;align-items:center">
              ${hotel.rating ? `<span style="background:rgba(255,209,102,0.22);border:1px solid rgba(255,209,102,0.5);color:#A07000;font-weight:700;padding:1px 7px;border-radius:20px;font-size:11px">★ ${hotel.rating}</span>` : ""}
              <span>${hotel.city}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:12px;color:#E8644A;font-weight:700;background:rgba(232,100,74,0.10);border:1px solid rgba(232,100,74,0.22);padding:3px 9px;border-radius:20px">${hotel.detourMinutes === 0 ? "🛣 Sur la route" : `↗ +${hotel.detourMinutes} min`}</span>
              <button onclick="window.__kipwayExpand('${hotel.id}')" style="padding:7px 16px;border-radius:20px;background:linear-gradient(135deg,#E8644A,#F09070);color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 3px 10px rgba(232,100,74,0.4)">Voir →</button>
            </div>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([hotel.lng, hotel.lat])
        .addTo(map);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(hotel.id);

        // Ferme les autres popups d'abord
        popupsRef.current.forEach((p, pid) => {
          if (pid !== hotel.id && p.isOpen()) p.remove();
        });

        if (popup.isOpen()) {
          popup.remove();
          return;
        }

        // Zone centrale = 60% du viewport de la carte (marges 20% de chaque côté).
        // Si l'hôtel est dedans → popup direct, pas de déplacement.
        // Si l'hôtel est en bordure (20% extérieur) → flyTo fluide, popup après.
        const { width, height } = map.getContainer().getBoundingClientRect();
        const pt = map.project([hotel.lng, hotel.lat]);
        const inCenter = width > 0 &&
          pt.x > width * 0.20 && pt.x < width * 0.80 &&
          pt.y > height * 0.20 && pt.y < height * 0.80;

        popup.setLngLat([hotel.lng, hotel.lat]).addTo(map);
        if (!inCenter) {
          const currentZoom = map.getZoom();
          map.flyTo({
            center: [hotel.lng, hotel.lat],
            zoom: currentZoom,
            duration: 900,
            essential: true,
            curve: 1,
          });
        }
      });

      markersRef.current.set(hotel.id, marker);
      popupsRef.current.set(hotel.id, popup);
    });

    (window as any).__kipwayExpand = (id: string) => onExpandRef.current(id);
    (window as any).__kipwayClose  = (id: string) => { popupsRef.current.get(id)?.remove(); onSelectRef.current(id); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotels]);

  // Update marker style on selection / hover change
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      const hotel = hotels.find((h) => h.id === id);
      const isSelected = id === selectedHotelId;
      const isHovered = id === hoveredHotelId;
      if (hotel) el.innerHTML = createPriceHTML(hotel.pricePerNight, isSelected, isHovered);
      el.style.zIndex = isHovered ? "10" : isSelected ? "5" : "";
    });
  }, [selectedHotelId, hoveredHotelId, hotels]);


  // Zoom vers le point d'étape quand les hôtels arrivent
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToStop) return;
    map.flyTo({
      center: [flyToStop.lng, flyToStop.lat],
      zoom: 10,
      duration: 1400,
      essential: true,
      curve: 1.4,
    });
  }, [flyToStop]);

  return (
    <>
      <style>{`
        @keyframes kw-pulse {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        .maplibregl-popup-content {
          padding: 0 !important;
          border-radius: 18px !important;
          overflow: hidden !important;
          background: transparent !important;
          box-shadow: 0 8px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.6) !important;
          border: 1px solid rgba(255,255,255,0.55) !important;
        }
        .maplibregl-popup-tip { display: none !important; }
        .kw-popup-card:hover .kw-close-btn { opacity: 1 !important; }
        .kw-close-btn:hover { background: rgba(0,0,0,0.65) !important; }
      `}</style>
      <div ref={containerRef} style={{ height: "100%", width: "100%", background: "#e8e8e8" }} />
    </>
  );
}
