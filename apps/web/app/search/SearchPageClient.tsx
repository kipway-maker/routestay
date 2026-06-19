"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import HotelCard from "@/components/HotelCard";
import { Filters, DEFAULT_FILTERS } from "@/components/FilterBar";
import FilterModal from "@/components/FilterModal";
import FocusPointBand from "@/components/FocusPointBand";
import HotelDetailOverlay from "@/components/HotelDetailOverlay";
import SpotlightTutorial from "@/components/SpotlightTutorial";
import { Hotel } from "@/lib/amadeus";

const MapView = nextDynamic(() => import("@/components/MapView"), { ssr: false });

interface Place { name: string; lat: number; lng: number; }

function getNowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
      <div style={{ width: "100%", paddingBottom: "66%", background: "#e5e7eb", animation: "pulse 1.5s infinite" }} />
      <div style={{ padding: "12px 14px" }}>
        <div style={{ height: "14px", background: "#e5e7eb", borderRadius: "6px", marginBottom: "8px", width: "70%", animation: "pulse 1.5s infinite" }} />
        <div style={{ height: "12px", background: "#e5e7eb", borderRadius: "6px", width: "45%", animation: "pulse 1.5s infinite" }} />
      </div>
    </div>
  );
}

function CarLoader({ label = "Recherche en cours…" }: { label?: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "48px 24px", gap: "20px",
    }}>
      <style>{`
        @keyframes kw-car-drive {
          0%   { transform: translateX(-60px); opacity: 0; }
          12%  { opacity: 1; }
          78%  { opacity: 1; }
          92%  { opacity: 0; transform: translateX(calc(100% + 60px)); }
          100% { transform: translateX(-60px); opacity: 0; }
        }
        @keyframes kw-wheel {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes kw-road-dash {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -32; }
        }
        @keyframes kw-exhaust {
          0%   { opacity: 0.7; transform: translateX(0) scale(1); }
          100% { opacity: 0; transform: translateX(-18px) scale(1.8); }
        }
        @keyframes kw-loader-dots {
          0%, 80%, 100% { opacity: 0.25; }
          40%            { opacity: 1; }
        }
      `}</style>

      {/* Scène */}
      <div style={{ position: "relative", width: "220px", height: "72px", overflow: "hidden" }}>

        {/* Route */}
        <svg width="220" height="20" viewBox="0 0 220 20" style={{ position: "absolute", bottom: 0, left: 0 }}>
          {/* Asphalte */}
          <rect x="0" y="8" width="220" height="12" rx="4" fill="#E2E8F0"/>
          {/* Tirets centraux animés */}
          <line x1="0" y1="14" x2="220" y2="14"
            stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"
            strokeDasharray="16 16"
            style={{ animation: "kw-road-dash 0.5s linear infinite" }}
          />
        </svg>

        {/* Voiture animée */}
        <div style={{
          position: "absolute", bottom: "10px", left: 0,
          animation: "kw-car-drive 1.8s cubic-bezier(0.4,0,0.2,1) infinite",
        }}>
          {/* Fumée arrière (gauche = arrière de la voiture) */}
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              position: "absolute",
              left: "-4px", bottom: "14px",
              width: i === 0 ? "6px" : i === 1 ? "5px" : "4px",
              height: i === 0 ? "6px" : i === 1 ? "5px" : "4px",
              borderRadius: "50%",
              background: "rgba(148,163,184,0.55)",
              animation: `kw-exhaust ${0.55 + i * 0.18}s ease-out ${i * 0.14}s infinite`,
            }} />
          ))}

          {/* SVG voiture orientée → droite
              Avant (droite) : capot bas et plat, phare rond
              Arrière (gauche) : custode verticale, feu rouge
              Habitacle : parebrise avant incliné vers la droite/avant */}
          <svg width="80" height="36" viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Carrosserie basse */}
            <path d="M6 20 Q6 18 8 18 L72 18 Q76 18 76 22 L76 30 Q76 32 74 32 L8 32 Q6 32 6 30 Z" fill="#D4563E"/>
            {/* Habitacle —
                Arrière (gauche) vertical : de x=16,y=18 monte à x=20,y=7
                Toit plat de x=20 à x=52
                Parebrise avant (droite) incliné vers l'avant : de x=52,y=7 descend à x=64,y=18 */}
            <path d="M16 18 L22 7 L52 7 L64 18 Z" fill="#E8644A"/>
            {/* Vitre arrière (gauche, petite) */}
            <path d="M18 17 L23 8 L30 8 L30 17 Z" fill="rgba(255,255,255,0.28)"/>
            {/* Vitre avant (droite, grande) */}
            <path d="M32 17 L32 8 L51 8 L62 17 Z" fill="rgba(255,255,255,0.38)"/>
            {/* Montant central */}
            <line x1="31" y1="7" x2="31" y2="18" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5"/>
            {/* Custode arrière ombre */}
            <path d="M16 18 L22 7" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Phare avant (droite) */}
            <ellipse cx="73" cy="23" rx="3" ry="2.2" fill="rgba(255,240,160,0.95)"/>
            <ellipse cx="73" cy="23" rx="1.6" ry="1.1" fill="#fff"/>
            {/* Feu arrière (gauche) */}
            <rect x="4" y="22" width="4" height="5" rx="1.5" fill="rgba(200,30,30,0.85)"/>
            {/* Roue avant (droite, x≈58) */}
            <g style={{ transformOrigin: "59px 32px", animation: "kw-wheel 0.35s linear infinite" }}>
              <circle cx="59" cy="32" r="7" fill="#1E1E2E"/>
              <circle cx="59" cy="32" r="4.5" fill="#374151"/>
              <circle cx="59" cy="32" r="2" fill="#6B7280"/>
              <line x1="59" y1="26.5" x2="59" y2="37.5" stroke="#9CA3AF" strokeWidth="1.2"/>
              <line x1="53.5" y1="32" x2="64.5" y2="32" stroke="#9CA3AF" strokeWidth="1.2"/>
            </g>
            {/* Roue arrière (gauche, x≈21) */}
            <g style={{ transformOrigin: "21px 32px", animation: "kw-wheel 0.35s linear infinite" }}>
              <circle cx="21" cy="32" r="7" fill="#1E1E2E"/>
              <circle cx="21" cy="32" r="4.5" fill="#374151"/>
              <circle cx="21" cy="32" r="2" fill="#6B7280"/>
              <line x1="21" y1="26.5" x2="21" y2="37.5" stroke="#9CA3AF" strokeWidth="1.2"/>
              <line x1="15.5" y1="32" x2="26.5" y2="32" stroke="#9CA3AF" strokeWidth="1.2"/>
            </g>
          </svg>
        </div>
      </div>

      {/* Label */}
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280" }}>
        {label}
      </div>
    </div>
  );
}

const ACCOM_TABS = [
  { value: null,       label: "Tous",     emoji: "🌍" },
  { value: "hotel",    label: "Hôtel",    emoji: "🏨" },
  { value: "bb",       label: "B&B",      emoji: "🏡" },
  { value: "auberge",  label: "Auberge",  emoji: "🏔️" },
  { value: "camping",  label: "Camping",  emoji: "⛺" },
] as const;

function getGridCols(pct: number): string {
  // minmax(0, 1fr) au lieu de 1fr pour éviter que le texte "nowrap" force les colonnes à déborder
  if (pct < 32) return "minmax(0, 1fr)";
  if (pct < 46) return "repeat(2, minmax(0, 1fr))";
  if (pct < 62) return "repeat(3, minmax(0, 1fr))";
  if (pct < 74) return "repeat(4, minmax(0, 1fr))";
  return "repeat(5, minmax(0, 1fr))";
}

function activeFilterCount(f: Filters): number {
  let n = 0;
  if (f.maxPrice !== null) n++;
  if (f.maxDetourMin !== null) n++;
  if (f.minRating !== null) n++;
  if (f.sortBy !== "default") n++;
if (f.routePosition !== "all") n++;
  return n;
}

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [splitPct, setSplitPct] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function onMouseMove(ev: MouseEvent) {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(75, Math.max(25, pct)));
    }
    function onMouseUp() {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  const [origin, setOrigin] = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const [route, setRoute] = useState<{ type: string; coordinates: [number, number][] } | null>(null);
  const [routeDurationSec, setRouteDurationSec] = useState<number>(0);
  const [waypoints, setWaypoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);       // chargement itinéraire
  const [hotelLoading, setHotelLoading] = useState(false); // chargement hôtels
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [hoveredHotel, setHoveredHotel] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [departureTime, setDepartureTime] = useState<string>(getNowHHMM());
  const [departureDate, setDepartureDate] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("date");
      if (p && /^\d{4}-\d{2}-\d{2}$/.test(p)) return p;
    }
    return new Date().toISOString().split("T")[0];
  });
  const [useArrivalCheck, setUseArrivalCheck] = useState(false);
  const [filterReception24h, setFilterReception24h] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [expandedHotelId, setExpandedHotelId] = useState<string | null>(null);
  // Point d'étape : position sur la route (0–100), null avant le premier chargement
  const [stopPct, setStopPct] = useState<number | null>(null);
  const [flyToStop, setFlyToStop] = useState<{ lat: number; lng: number } | null>(null);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const [hoverCity, setHoverCity] = useState<string | null>(null);
  const [stopPinHovered, setStopPinHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [stopPinPulsing, setStopPinPulsing] = useState(false);
  const [tutorialReady, setTutorialReady] = useState(false);
  const isDraggingStop = useRef(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const reverseDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityCache = useRef<Map<string, string>>(new Map());

  function getTimeAtPct(pct: number): string {
    return addMinutes(departureTime, Math.round((pct / 100) * routeDurationMin));
  }

  function getArrival(hotel: Hotel): string | null {
    if (!departureTime || !routeDurationSec) return null;
    return addMinutes(departureTime, Math.round(routeDurationSec / 60) + hotel.detourMinutes);
  }

  function timeToMin(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function getCheckinStatus(hotel: Hotel): "ok" | "tight" | "late" | "always" {
    if (!useArrivalCheck) return "ok";
    const arrival = getArrival(hotel);
    if (!hotel.checkinDeadline) return "always"; // 24h
    if (!arrival) return "ok";
    const arrMin = timeToMin(arrival);
    const deadlineMin = timeToMin(hotel.checkinDeadline);
    if (arrMin > deadlineMin) return "late";
    if (deadlineMin - arrMin <= 60) return "tight"; // moins d'1h de marge
    return "ok";
  }

  useEffect(() => {
    const fromName = searchParams.get("fromName");
    const fromLat = searchParams.get("fromLat");
    const fromLng = searchParams.get("fromLng");
    const toName = searchParams.get("toName");
    const toLat = searchParams.get("toLat");
    const toLng = searchParams.get("toLng");
    if (fromName && fromLat && fromLng && toName && toLat && toLng) {
      const org = { name: fromName, lat: parseFloat(fromLat), lng: parseFloat(fromLng) };
      const dest = { name: toName, lat: parseFloat(toLat), lng: parseFloat(toLng) };
      setOrigin(org);
      setDestination(dest);
      runSearch(org, dest);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredHotels = useMemo(() => {
    let list = [...hotels];
    // Filtre sources
    if (filters.sources.length < 3)
      list = list.filter((h) => filters.sources.includes(h.source as any) || h.source === "osm");
    if (filters.maxPrice !== null)
      list = list.filter((h) => h.pricePerNight !== null && h.pricePerNight <= filters.maxPrice!);
    if (filters.maxDetourMin !== null)
      list = list.filter((h) => h.detourMinutes <= filters.maxDetourMin!);
    if (filters.minRating !== null)
      list = list.filter((h) => h.rating !== null && h.rating >= filters.minRating!);
if (filterReception24h)
      list = list.filter((h) => h.checkinDeadline === null);
    if (filters.accommodationType !== null)
      list = list.filter((h) => h.accommodationType === filters.accommodationType);
    if (filters.sortBy === "price_asc")
      list.sort((a, b) => (a.pricePerNight ?? 999) - (b.pricePerNight ?? 999));
    else if (filters.sortBy === "rating_desc")
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (filters.sortBy === "detour_asc")
      list.sort((a, b) => a.detourMinutes - b.detourMinutes);
    if (useArrivalCheck) {
      list.sort((a, b) => {
        const rank = { ok: 0, always: 0, tight: 1, late: 2 };
        return (rank[getCheckinStatus(a)] ?? 0) - (rank[getCheckinStatus(b)] ?? 0);
      });
    }
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotels, filters, filterReception24h, useArrivalCheck, departureTime, routeDurationSec]);

  function toggleHotel(id: string) {
    setSelectedHotel((prev) => (prev === id ? null : id));
  }

  function markInteracted() {
    if (!hasInteracted) { setHasInteracted(true); setStopPinPulsing(false); }
  }

  /** Fetch hôtels autour d'un point précis de la route */
  async function fetchHotelsAt(pct: number, wpts: Array<{ lat: number; lng: number }>) {
    if (!wpts.length) return;
    const idx = Math.min(wpts.length - 1, Math.floor((pct / 100) * wpts.length));
    const stopPoint = wpts[idx];
    setFlyToStop(null); // reset pour que le prochain résultat retrigger l'effet
    setHotelLoading(true);
    setHotels([]);
    setSelectedHotel(null);
    try {
      const res = await fetch("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stopPoint, stopPct: pct, departureDate, sources: filters.sources }),
      });
      if (res.ok) {
        setHotels(await res.json());
        setTutorialReady(true);
        setFlyToStop({ lat: stopPoint.lat, lng: stopPoint.lng });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHotelLoading(false);
    }
  }

  async function runSearch(org: Place, dest: Place) {
    setLoading(true);
    setHotels([]);
    setWaypoints([]);
    setSelectedHotel(null);
    setRoute(null);
    setRouteDurationSec(0);
    setStopPct(null);
    setFilters(DEFAULT_FILTERS);
    try {
      const dirRes = await fetch("/api/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: org, destination: dest }),
      });
      if (!dirRes.ok) { setLoading(false); return; }
      const dirData = await dirRes.json();
      setRoute(dirData.geometry);
      setRouteDurationSec(dirData.duration ?? 0);
      const wpts: Array<{ lat: number; lng: number }> = dirData.waypoints ?? [];
      setWaypoints(wpts);
      setLoading(false);
      setHasInteracted(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  function handleSearch(org: Place, dest: Place, date?: string) {
    setOrigin(org);
    setDestination(dest);
    if (date) setDepartureDate(date);
    setTutorialReady(false);
    const params = new URLSearchParams({
      fromName: org.name, fromLat: String(org.lat), fromLng: String(org.lng),
      toName: dest.name, toLat: String(dest.lat), toLng: String(dest.lng),
      date: date ?? departureDate,
    });
    router.replace(`/search?${params.toString()}`);
    runSearch(org, dest);
  }

  const routeDurationMin = Math.round(routeDurationSec / 60);
  const activeFilters = activeFilterCount(filters);

  return (
    <>
    <style>{`
      @keyframes kw-hint-fade {
        from { opacity: 0; transform: translateX(6px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes kw-pulse {
        0%   { transform: scale(1); opacity: 0.7; }
        100% { transform: scale(2.8); opacity: 0; }
      }
      @keyframes kw-pin-pulse {
        0%, 100% { box-shadow: 0 0 0 3px rgba(232,100,74,0.25); }
        50%       { box-shadow: 0 0 0 8px rgba(232,100,74,0.0); }
      }
    `}</style>
    <div ref={containerRef} style={{
      display: "flex", height: "100vh", width: "100%", overflow: "hidden",
      background: "#F8F7F4",
      position: "relative",
    }}>


      {/* ── PANNEAU HÔTELS — gauche ── */}
      <div style={{
        width: `${splitPct}%`,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
        background: "transparent",
        position: "relative", zIndex: 1,
      }}>

        {/* Header : logo + search + filtres */}
        <div style={{
          padding: "8px 20px",
          background: "#FFFFFF",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          flexShrink: 0,
          display: "flex", alignItems: "center", gap: "12px",
          position: "relative",
          overflow: "visible",
        }}>
          {/* Gradient top border */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #E8644A, #F09070, #6FA8C0)" }} />


          <Link href="/" style={{ textDecoration: "none", flexShrink: 0, position: "relative", zIndex: 3 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-kipway-v3.png" alt="KipWay" style={{ height: "88px", width: "auto" }} />
          </Link>

          {/* z-index: 2 → l'input est AU-DESSUS du ruban mais le ruban passe derrière */}
          <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 2 }}>
            <SearchBar onSearch={handleSearch} loading={loading} compact />
          </div>

        </div>

        {/* ── BANDE ROUTE + FILTRES RAPIDES ── */}
        {routeDurationMin > 0 && (
          <div style={{
            padding: "14px 20px 14px",
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            flexShrink: 0,
          }}>
            {/* Label section — hiérarchie principale */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8644A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h18M12 3l9 9-9 9"/>
                </svg>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#1E1E2E", letterSpacing: "0.01em", fontFamily: "var(--font-nunito), sans-serif" }}>
                  Votre étape
                </span>
                {stopPct !== null && !hotelLoading && (
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#E8644A" }}>
                    — {getTimeAtPct(stopPct)}
                  </span>
                )}
              </div>

              {/* Hint — toujours visible, guide l'utilisateur */}
              {!hasInteracted && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  fontSize: "13px", fontWeight: 700,
                  color: "#E8644A",
                  background: "rgba(232,100,74,0.08)",
                  border: "1px solid rgba(232,100,74,0.20)",
                  borderRadius: "20px",
                  padding: "5px 12px",
                  flexShrink: 1, lineHeight: 1.3,
                  animation: "pulse-hint 2s ease-in-out infinite",
                }}>
                  ↔ Déplacez le point sur la route pour choisir votre étape
                </span>
              )}

            </div>

            {/* ── Timeline départ → durée → arrivée ── */}
            <div style={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              borderRadius: "18px",
              padding: "16px 20px 14px",
              marginBottom: "12px",
              border: "1px solid rgba(232,100,74,0.12)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0" }}>

                {/* Départ */}
                <div style={{ display: "flex", flexDirection: "column", minWidth: "90px" }}>
                  {origin && (
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px", marginBottom: "1px" }}>
                      {origin.name.split(",")[0]}
                    </span>
                  )}
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    style={{
                      border: "none", background: "transparent", padding: 0,
                      fontSize: "24px", fontWeight: 800, color: "#1E1E2E",
                      outline: "none", cursor: "pointer", lineHeight: 1,
                      fontFamily: "var(--font-nunito), sans-serif",
                      width: "108px", marginBottom: "2px",
                    }}
                  />
                  {/* Date — badge visible cliquable */}
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", position: "relative" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, color: "#E8644A",
                      background: "rgba(232,100,74,0.10)",
                      border: "1px solid rgba(232,100,74,0.25)",
                      borderRadius: "6px", padding: "2px 7px",
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}
                      onClick={() => (document.getElementById("kw-date-input") as HTMLInputElement)?.showPicker?.()}
                    >
                      {new Date(departureDate + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                    <input
                      id="kw-date-input"
                      type="date"
                      value={departureDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                      tabIndex={-1}
                    />
                  </div>
                </div>

                {/* Ligne interactive */}
                <div style={{ flex: 1, margin: "0 14px" }}>
                  {/* Durée centrée */}
                  <div style={{ textAlign: "center", fontSize: "10px", color: "#9ca3af", fontWeight: 600, letterSpacing: "0.3px", marginBottom: "5px" }}>
                    {routeDurationMin >= 60
                      ? `${Math.floor(routeDurationMin / 60)}h${String(routeDurationMin % 60).padStart(2, "0")}`
                      : `${routeDurationMin} min`}
                  </div>

                  {/* Track — clic ou drag pour déplacer le point d'étape */}
                  <div
                    ref={timelineRef}
                    data-tutorial="timeline"
                    style={{ position: "relative", height: "36px", cursor: stopPct !== null ? "pointer" : "default", display: "flex", alignItems: "center" }}
                    onMouseMove={(e) => {
                      if (isDraggingStop.current) {
                        const rect = timelineRef.current!.getBoundingClientRect();
                        const pct = Math.max(2, Math.min(98, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
                        setStopPct(pct);
                        return;
                      }
                      if (!stopPct) return;
                      const rect = timelineRef.current!.getBoundingClientRect();
                      const pct = Math.max(2, Math.min(98, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
                      setHoverPct(pct);
                      if (reverseDebounceRef.current) clearTimeout(reverseDebounceRef.current);
                      if (!route?.coordinates?.length) return;
                      reverseDebounceRef.current = setTimeout(() => {
                        const coords = route.coordinates;
                        const idx = Math.min(coords.length - 1, Math.floor((pct / 100) * coords.length));
                        const [lng, lat] = coords[idx];
                        const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
                        if (cityCache.current.has(cacheKey)) { setHoverCity(cityCache.current.get(cacheKey)!); return; }
                        fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`)
                          .then((r) => r.json())
                          .then(({ city }) => { if (city) { cityCache.current.set(cacheKey, city); setHoverCity(city); } })
                          .catch(() => {});
                      }, 300);
                    }}
                    onMouseUp={(e) => {
                      if (!isDraggingStop.current) return;
                      isDraggingStop.current = false;
                      const rect = timelineRef.current!.getBoundingClientRect();
                      const pct = Math.max(2, Math.min(98, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
                      setStopPct(pct);
                      markInteracted();
                      fetchHotelsAt(pct, waypoints);
                    }}
                    onMouseLeave={() => {
                      setHoverPct(null); setHoverCity(null);
                      if (reverseDebounceRef.current) clearTimeout(reverseDebounceRef.current);
                      if (isDraggingStop.current) {
                        isDraggingStop.current = false;
                        if (stopPct !== null) fetchHotelsAt(stopPct, waypoints);
                      }
                    }}
                    onClick={(e) => {
                      if (!waypoints.length || isDraggingStop.current) return;
                      const rect = timelineRef.current!.getBoundingClientRect();
                      const pct = Math.max(2, Math.min(98, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
                      setStopPct(pct);
                      markInteracted();
                      fetchHotelsAt(pct, waypoints);
                    }}
                  >
                    {/* Rail */}
                    <div style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "#E2E8F0", borderRadius: "2px", top: "50%", transform: "translateY(-50%)" }}>
                      {stopPct !== null && (
                        <div style={{ position: "absolute", left: 0, width: `${stopPct}%`, height: "100%", background: "linear-gradient(to right, #E8644A, #F09070)", borderRadius: "2px" }} />
                      )}
                    </div>
                    {/* Point départ */}
                    <div style={{ position: "absolute", left: 0, width: "7px", height: "7px", borderRadius: "50%", background: "#CBD5E1", top: "50%", transform: "translateY(-50%)" }} />
                    {/* Flèche arrivée */}
                    <svg style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }} width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 5H9M9 5L5.5 1.5M9 5L5.5 8.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>

                    {/* Hover tooltip — masqué pendant le drag et sur le pin */}
                    {hoverPct !== null && !stopPinHovered && !isDraggingStop.current && (
                      <div style={{ position: "absolute", left: `${hoverPct}%`, transform: "translateX(-50%)", pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", transition: "left 0.04s linear" }}>
                        {hoverCity && (
                          <div style={{ background: "rgba(26,26,46,0.75)", color: "#fff", fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "8px", whiteSpace: "nowrap", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", marginBottom: "2px" }}>
                            {hoverCity}
                          </div>
                        )}
                        <div style={{ background: "#1E1E2E", color: "#fff", fontSize: "11px", fontWeight: 800, padding: "3px 9px", borderRadius: "10px", whiteSpace: "nowrap", boxShadow: "0 3px 10px rgba(0,0,0,0.2)", marginBottom: "3px", fontFamily: "var(--font-nunito), sans-serif" }}>
                          {getTimeAtPct(hoverPct)}
                        </div>
                        <div style={{ width: "1.5px", height: "5px", background: "#94A3B8" }} />
                        <div style={{ fontSize: "15px", lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>🚗</div>
                      </div>
                    )}

                    {/* Pin d'étape — draggable, affiche ✕ au hover */}
                    {stopPct !== null && (
                      <div
                        style={{ position: "absolute", left: `${stopPct}%`, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", cursor: "grab", zIndex: 10, userSelect: "none" }}
                        onMouseEnter={() => setStopPinHovered(true)}
                        onMouseLeave={() => setStopPinHovered(false)}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          isDraggingStop.current = true;
                          (e.currentTarget as HTMLElement).style.cursor = "grabbing";
                        }}
                        onMouseUp={(e) => {
                          e.stopPropagation();
                          if (!isDraggingStop.current) return;
                          isDraggingStop.current = false;
                          (e.currentTarget as HTMLElement).style.cursor = "grab";
                          fetchHotelsAt(stopPct, waypoints);
                        }}
                      >
                        <div
                          onClick={(e) => {
                            if (stopPinHovered && !isDraggingStop.current) {
                              e.stopPropagation();
                              setStopPct(null); setHotels([]); setHasInteracted(false); setFlyToStop(null);
                            }
                          }}
                          style={{
                            background: stopPinHovered && !hotelLoading ? "#EF4444" : hotelLoading ? "#9CA3AF" : "#E8644A",
                            color: "#fff", fontSize: "11px", fontWeight: 800,
                            padding: "4px 10px", borderRadius: "10px", whiteSpace: "nowrap",
                            boxShadow: stopPinHovered && !hotelLoading ? "0 3px 12px rgba(239,68,68,0.45)" : hotelLoading ? "0 3px 8px rgba(0,0,0,0.15)" : "0 3px 12px rgba(255,98,64,0.45)",
                            fontFamily: "var(--font-nunito), sans-serif", marginBottom: "2px",
                            transition: "background 0.15s, box-shadow 0.15s",
                            cursor: stopPinHovered ? "pointer" : "grab",
                          }}
                        >
                          {stopPinHovered && !hotelLoading ? "✕ Retirer" : getTimeAtPct(stopPct)}
                        </div>
                        <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `6px solid ${stopPinHovered && !hotelLoading ? "#EF4444" : hotelLoading ? "#9CA3AF" : "#E8644A"}`, marginBottom: "1px", transition: "border-top-color 0.15s" }} />
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: hotelLoading ? "#9CA3AF" : "#E8644A", border: "2px solid #fff", boxShadow: "0 0 0 3px rgba(255,98,64,0.25)", transition: "background 0.2s", animation: stopPinPulsing && !hotelLoading ? "kw-pin-pulse 1.4s ease-in-out infinite" : undefined }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrivée */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  {destination && (
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px", textAlign: "right", marginBottom: "1px" }}>
                      {destination.name.split(",")[0]}
                    </span>
                  )}
                  <span style={{ fontSize: "24px", fontWeight: 800, color: "#E8644A", lineHeight: 1, fontFamily: "var(--font-nunito), sans-serif", marginBottom: "2px" }}>
                    {addMinutes(departureTime, routeDurationMin)}
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.5px" }}>arrivée estimée</span>
                </div>
              </div>

            </div>

            {/* Filtres rapides — 3 pills + bouton Filtres */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              {([
                {
                  key: "checkin",
                  emoji: "⏰",
                  label: "Check-in",
                  sublabel: "Vérifie les horaires",
                  active: useArrivalCheck,
                  toggle: () => setUseArrivalCheck((v) => !v),
                },
                {
                  key: "nodetour",
                  emoji: "🛣",
                  label: "Sur la route",
                  sublabel: "Aucun détour",
                  active: filters.maxDetourMin === 5,
                  toggle: () => setFilters((f) => ({ ...f, maxDetourMin: f.maxDetourMin === 5 ? null : 5 })),
                },
                {
                  key: "24h",
                  emoji: "🌙",
                  label: "Accueil 24h",
                  sublabel: "Kiosque / réception",
                  active: filterReception24h,
                  toggle: () => setFilterReception24h((v) => !v),
                },
              ]).map((item) => (
                <button
                  key={item.key}
                  onClick={item.toggle}
                  style={{
                    display: "inline-flex", flexDirection: "column", alignItems: "flex-start",
                    gap: "2px",
                    padding: "10px 20px 10px 16px", borderRadius: "20px",
                    border: item.active ? "1.5px solid #E8644A" : "1.5px solid rgba(0,0,0,0.10)",
                    background: item.active
                      ? "linear-gradient(135deg, #E8644A 0%, #F09070 100%)"
                      : "rgba(255,255,255,0.80)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    color: item.active ? "#FFFFFF" : "#374151",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    whiteSpace: "nowrap",
                    boxShadow: item.active
                      ? "0 4px 12px rgba(232,100,74,0.30)"
                      : "0 1px 4px rgba(0,0,0,0.07)",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ fontSize: "11px" }}>{item.emoji}</span>
                    {item.label}
                  </span>
                  <span style={{
                    fontSize: "10px", fontWeight: 500,
                    color: item.active ? "rgba(255,255,255,0.80)" : "#9ca3af",
                    lineHeight: 1,
                  }}>
                    {item.sublabel}
                  </span>
                </button>
              ))}

              {/* Séparateur vertical */}
              <div style={{ width: "1px", height: "36px", background: "rgba(0,0,0,0.10)", flexShrink: 0 }} />

              {/* Bouton Filtres avancés */}
              {hotels.length > 0 && (
                <button
                  onClick={() => setFilterModalOpen(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "10px 18px", borderRadius: "20px",
                    border: activeFilters > 0 ? "1.5px solid #E8644A" : "1.5px solid rgba(0,0,0,0.10)",
                    background: activeFilters > 0 ? "#E8644A" : "rgba(255,255,255,0.80)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    color: activeFilters > 0 ? "#FFFFFF" : "#374151",
                    fontSize: "13px", fontWeight: 700, cursor: "pointer",
                    transition: "all 0.18s",
                    whiteSpace: "nowrap",
                    boxShadow: activeFilters > 0 ? "0 4px 12px rgba(232,100,74,0.30)" : "0 1px 4px rgba(0,0,0,0.07)",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="8" y1="12" x2="20" y2="12" />
                    <line x1="12" y1="18" x2="20" y2="18" />
                    <circle cx="4" cy="12" r="2" fill="currentColor" stroke="none" />
                    <circle cx="8" cy="18" r="2" fill="currentColor" stroke="none" />
                  </svg>
                  Filtres
                  {activeFilters > 0 && (
                    <span style={{
                      background: "rgba(255,255,255,0.30)", color: "#fff",
                      borderRadius: "50%", width: "18px", height: "18px",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: "10px", fontWeight: 700,
                    }}>
                      {activeFilters}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Focus Point — désactivé temporairement
        {!loading && hotels.length > 0 && (
          <FocusPointBand
            hotels={hotels}
            selectedHotelId={selectedHotel}
            onSelectHotel={toggleHotel}
          />
        )}
        */}

        {/* En-tête résultats + tag filtres actifs */}
        <div style={{
          padding: "14px 16px 8px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {!hotelLoading && hotels.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#1E1E2E", fontFamily: "var(--font-nunito)", margin: 0 }}>
              <span style={{ color: "#E8644A", fontSize: "20px", fontWeight: 900 }}>{filteredHotels.length}</span>{" "}
              hôtel{filteredHotels.length !== 1 ? "s" : ""}{stopPct !== null ? ` autour de ${getTimeAtPct(stopPct)}` : ""}
              {filteredHotels.length < hotels.length && (
                <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 400 }}>
                  {" "}(sur {hotels.length})
                </span>
              )}
            </p>
            </div>
          ) : null}
        </div>

        {/* Grille */}
        <div className="scroll-stable" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0 16px 20px", minWidth: 0 }}>
          {hotelLoading ? (
            <CarLoader label="Recherche des hôtels" />
          ) : loading ? (
            <CarLoader label="Calcul de l'itinéraire" />
          ) : filteredHotels.length === 0 && hotels.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "#6B7280", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#1E1E2E", marginBottom: "6px" }}>Aucun résultat</p>
              <p style={{ fontSize: "13px" }}>Essayez d&apos;élargir vos filtres</p>
            </div>
          ) : (
            <div data-tutorial="hotels" style={{ display: "grid", gridTemplateColumns: getGridCols(splitPct), gap: "12px" }}>
              {filteredHotels.map((hotel) => {
                const status = getCheckinStatus(hotel);
                return (
                  <div
                    key={hotel.id}
                    style={{
                      opacity: status === "late" ? 0.45 : 1,
                      transition: "opacity 0.2s",
                      position: "relative",
                    }}
                  >
                    {status === "late" && (
                      <div style={{
                        position: "absolute", top: "8px", right: "8px", zIndex: 2,
                        background: "#EF4444", color: "#fff",
                        fontSize: "10px", fontWeight: 700,
                        padding: "3px 9px", borderRadius: "20px",
                        boxShadow: "0 2px 6px rgba(239,68,68,0.45)",
                        pointerEvents: "none",
                      }}>
                        ✕ Fermé
                      </div>
                    )}
                    {status === "tight" && (
                      <div style={{
                        position: "absolute", top: "8px", right: "8px", zIndex: 2,
                        background: "#F59E0B", color: "#fff",
                        fontSize: "10px", fontWeight: 700,
                        padding: "3px 9px", borderRadius: "20px",
                        boxShadow: "0 2px 6px rgba(245,158,11,0.45)",
                        pointerEvents: "none",
                      }}>
                        ⚠ Limite
                      </div>
                    )}
                    <div
                      onMouseEnter={() => setHoveredHotel(hotel.id)}
                      onMouseLeave={() => setHoveredHotel(null)}
                    >
                      <HotelCard
                        hotel={hotel}
                        selected={selectedHotel === hotel.id}
                        onSelect={(id) => { toggleHotel(id); setExpandedHotelId(id); }}
                        estimatedArrival={useArrivalCheck ? getArrival(hotel) : null}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── DIVISEUR DRAGGABLE ── */}
      <div
        onMouseDown={handleDividerMouseDown}
        style={{
          width: "14px", flexShrink: 0,
          cursor: "col-resize",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent", zIndex: 10, position: "relative",
        }}
      >
        <div
          style={{
            width: "5px", height: "52px", borderRadius: "4px",
            background: "#d1d5db",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "3px",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#E8644A")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#d1d5db")}
        >
          <span style={{ fontSize: "7px", color: "#fff", lineHeight: 1, marginLeft: "-1px" }}>◀</span>
          <span style={{ fontSize: "7px", color: "#fff", lineHeight: 1, marginLeft: "1px" }}>▶</span>
        </div>
      </div>

      {/* ── CARTE — droite ── */}
      <div data-tutorial="map" style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <MapView
          route={route}
          hotels={filteredHotels}
          origin={origin}
          destination={destination}
          selectedHotelId={selectedHotel}
          hoveredHotelId={hoveredHotel}
          onSelectHotel={toggleHotel}
          onExpandHotel={(id) => { toggleHotel(id); setExpandedHotelId(id); }}
          stopPct={stopPct}
          waypoints={waypoints}
          onRouteClick={(pct) => {
            setStopPct(pct);
            markInteracted();
            fetchHotelsAt(pct, waypoints);
          }}
          getTimeAtPct={getTimeAtPct}
          stopPinPulsing={stopPinPulsing}
          flyToStop={flyToStop}
        />
      </div>

      {/* ── MODALE FILTRES ── */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={filters}
        onChange={setFilters}
        hotels={hotels}
        filteredCount={filteredHotels.length}
      />

      {/* ── OVERLAY DÉTAIL HÔTEL ── */}
      {expandedHotelId && (() => {
        const h = hotels.find((x) => x.id === expandedHotelId);
        return h ? (
          <HotelDetailOverlay
            hotel={h}
            estimatedArrival={getArrival(h)}
            departureDate={departureDate}
            onClose={() => setExpandedHotelId(null)}
          />
        ) : null;
      })()}
    </div>

    {/* ── TUTORIEL PREMIÈRE VISITE ── */}
    <SpotlightTutorial ready={tutorialReady} />
    </>
  );
}
