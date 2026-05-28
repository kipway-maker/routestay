"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Hotel } from "@/lib/amadeus";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY ?? "";
const MAP_STYLE = `https://api.maptiler.com/maps/019e69f3-cd46-753f-a7c4-d5924682d95e/style.json?key=${MAPTILER_KEY}`;

function createPriceHTML(price: number | null, selected: boolean) {
  const bg = selected ? "#E8644A" : "#1E1E2E";
  const label = price ? `${price} €` : "—";
  return `<div style="
    background: ${bg};
    color: #fff;
    border-radius: 20px;
    padding: 5px 10px;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    border: 2px solid #fff;
    transform: ${selected ? "scale(1.15)" : "scale(1)"};
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    cursor: pointer;
    transition: transform 0.15s, background 0.15s;
  ">${label}</div>`;
}

interface MapViewProps {
  route: { type: string; coordinates: [number, number][] } | null;
  hotels: Hotel[];
  origin: { name: string; lat: number; lng: number } | null;
  destination: { name: string; lat: number; lng: number } | null;
  selectedHotelId: string | null;
  onSelectHotel: (id: string) => void;
  onExpandHotel: (id: string) => void;
}

export default function MapView({ route, hotels, origin, destination, selectedHotelId, onSelectHotel, onExpandHotel }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const popupsRef = useRef<Map<string, maplibregl.Popup>>(new Map());

  // Keep callbacks in refs so marker event listeners always call the latest version
  // without needing to be in the dependency array (avoids marker recreation on every render)
  const onSelectRef = useRef(onSelectHotel);
  const onExpandRef = useRef(onExpandHotel);
  useEffect(() => { onSelectRef.current = onSelectHotel; }, [onSelectHotel]);
  useEffect(() => { onExpandRef.current = onExpandHotel; }, [onExpandHotel]);

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

    map.on("load", () => {
      map.addSource("route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } } });
      map.addLayer({ id: "route-line", type: "line", source: "route",
        paint: { "line-color": "#E8644A", "line-width": 5, "line-opacity": 0.95 },
        layout: { "line-cap": "round", "line-join": "round" },
      });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update route
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("route") as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    src.setData({
      type: "Feature", properties: {},
      geometry: { type: "LineString", coordinates: route?.coordinates ?? [] },
    });
  }, [route]);

  // Fit bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (route && route.coordinates.length > 0) {
      const lngs = route.coordinates.map(([lng]) => lng);
      const lats = route.coordinates.map(([, lat]) => lat);
      map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 60, duration: 600 });
    } else if (origin && destination) {
      map.fitBounds([[Math.min(origin.lng, destination.lng), Math.min(origin.lat, destination.lat)],
        [Math.max(origin.lng, destination.lng), Math.max(origin.lat, destination.lat)]], { padding: 60 });
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

  // ── Hotel markers — only recreated when the hotels LIST changes ──────────────
  // selectedHotelId is intentionally NOT a dep here: we handle style updates
  // in a separate effect so open popups are never destroyed by a selection change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();
    popupsRef.current.clear();

    hotels.forEach((hotel) => {
      const el = document.createElement("div");
      el.innerHTML = createPriceHTML(hotel.pricePerNight, false);

      const popup = new maplibregl.Popup({ offset: 25, maxWidth: "300px" }).setHTML(`
        <div style="width:260px;font-family:system-ui,sans-serif;padding:8px">
          <div style="width:100%;height:140px;border-radius:12px;overflow:hidden;margin-bottom:12px;background:#f3f4f6">
            <img src="${hotel.imageUrl}" style="width:100%;height:100%;object-fit:cover"
              onerror="this.src='https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop'"/>
          </div>
          <div style="font-weight:700;font-size:14px;color:#1E1E2E;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${hotel.name}</div>
          <div style="font-size:12px;color:#6B7280;margin-bottom:12px;display:flex;gap:8px">
            <span>${hotel.city}</span>${hotel.rating ? `<span>★ ${hotel.rating}</span>` : ""}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:12px;color:#E8644A;font-weight:600">${hotel.detourMinutes === 0 ? "Sur la route" : `+${hotel.detourMinutes} min`}</span>
            <button onclick="window.__kipwayExpand('${hotel.id}')" style="padding:8px 16px;border-radius:16px;background:#E8644A;color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer">Voir →</button>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([hotel.lng, hotel.lat])
        .setPopup(popup)
        .addTo(map);

      // Use refs so the closure never goes stale
      el.addEventListener("click", () => {
        onSelectRef.current(hotel.id);
        if (!marker.getPopup()?.isOpen()) {
          marker.togglePopup();
        }
      });

      markersRef.current.set(hotel.id, marker);
      popupsRef.current.set(hotel.id, popup);
    });

    // Global handler for the "Voir →" button inside the popup
    (window as any).__kipwayExpand = (id: string) => onExpandRef.current(id);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotels]);

  // ── Update marker STYLE when selection changes (no recreation) ──────────────
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      const hotel = hotels.find((h) => h.id === id);
      if (hotel) el.innerHTML = createPriceHTML(hotel.pricePerNight, id === selectedHotelId);
    });
  }, [selectedHotelId, hotels]);

  // Fly to selected hotel
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedHotelId) return;
    const hotel = hotels.find((h) => h.id === selectedHotelId);
    if (hotel) map.flyTo({ center: [hotel.lng, hotel.lat], zoom: 11, duration: 800 });
  }, [selectedHotelId, hotels]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%", background: "#e8e8e8" }} />;
}
