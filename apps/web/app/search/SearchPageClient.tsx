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

const ACCOM_TABS = [
  { value: null,       label: "Tous",     emoji: "🌍" },
  { value: "hotel",    label: "Hôtel",    emoji: "🏨" },
  { value: "bb",       label: "B&B",      emoji: "🏡" },
  { value: "auberge",  label: "Auberge",  emoji: "🏔️" },
  { value: "camping",  label: "Camping",  emoji: "⛺" },
] as const;

function getGridCols(pct: number): string {
  if (pct < 32) return "1fr";
  if (pct < 46) return "1fr 1fr";
  if (pct < 62) return "repeat(3, 1fr)";
  if (pct < 74) return "repeat(4, 1fr)";
  return "repeat(5, 1fr)";
}

function activeFilterCount(f: Filters): number {
  let n = 0;
  if (f.maxPrice !== null) n++;
  if (f.maxDetourMin !== null) n++;
  if (f.minRating !== null) n++;
  if (f.sortBy !== "default") n++;
  if (f.evOnly) n++;
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
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [departureTime, setDepartureTime] = useState<string>(getNowHHMM());
  const [departureDate, setDepartureDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [useArrivalCheck, setUseArrivalCheck] = useState(false);
  const [filterReception24h, setFilterReception24h] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [expandedHotelId, setExpandedHotelId] = useState<string | null>(null);
  // Milestone : position sur la route (0–100), null = pas de milestone actif
  const [milestonePct, setMilestonePct] = useState<number | null>(null);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const [hoverCity, setHoverCity] = useState<string | null>(null);
  const [milestoneHovered, setMilestoneHovered] = useState(false);
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
    if (filters.maxPrice !== null)
      list = list.filter((h) => h.pricePerNight !== null && h.pricePerNight <= filters.maxPrice!);
    if (filters.maxDetourMin !== null)
      list = list.filter((h) => h.detourMinutes <= filters.maxDetourMin!);
    if (filters.minRating !== null)
      list = list.filter((h) => h.rating !== null && h.rating >= filters.minRating!);
    if (filters.evOnly)
      list = list.filter((h) => h.hasEVCharger);
    if (filterReception24h)
      list = list.filter((h) => h.checkinDeadline === null);
    if (milestonePct !== null)
      list = list.filter((h) => Math.abs(h.routePositionPct - milestonePct) <= 18);
    if (filters.accommodationType !== null)
      list = list.filter((h) => h.accommodationType === filters.accommodationType);
    if (filters.routePosition !== "all") {
      const ranges = { start: [0, 33], mid: [34, 66], end: [67, 100] } as Record<string, [number, number]>;
      const [min, max] = ranges[filters.routePosition] ?? [0, 100];
      list = list.filter((h) => h.routePositionPct >= min && h.routePositionPct <= max);
    }
    if (filters.sortBy === "price_asc")
      list.sort((a, b) => (a.pricePerNight ?? 999) - (b.pricePerNight ?? 999));
    else if (filters.sortBy === "rating_desc")
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (filters.sortBy === "detour_asc")
      list.sort((a, b) => a.detourMinutes - b.detourMinutes);
    // Quand le check arrivée est actif, les "late" vont en bas
    if (useArrivalCheck) {
      list.sort((a, b) => {
        const rank = { ok: 0, always: 0, tight: 1, late: 2 };
        return (rank[getCheckinStatus(a)] ?? 0) - (rank[getCheckinStatus(b)] ?? 0);
      });
    }
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotels, filters, filterReception24h, milestonePct, useArrivalCheck, departureTime, routeDurationSec]);

  function toggleHotel(id: string) {
    setSelectedHotel((prev) => (prev === id ? null : id));
  }

  async function runSearch(org: Place, dest: Place) {
    setLoading(true);
    setHotels([]);
    setSelectedHotel(null);
    setRoute(null);
    setRouteDurationSec(0);
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

      const hotelRes = await fetch("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: dirData.waypoints }),
      });
      if (!hotelRes.ok) { setLoading(false); return; }
      setHotels(await hotelRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(org: Place, dest: Place) {
    setOrigin(org);
    setDestination(dest);
    const params = new URLSearchParams({
      fromName: org.name, fromLat: String(org.lat), fromLng: String(org.lng),
      toName: dest.name, toLat: String(dest.lat), toLng: String(dest.lng),
    });
    router.replace(`/search?${params.toString()}`);
    runSearch(org, dest);
  }

  const routeDurationMin = Math.round(routeDurationSec / 60);
  const activeFilters = activeFilterCount(filters);

  return (
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
          isolation: "isolate",
        }}>
          {/* Gradient top border — avoids border-image / border-radius incompatibility on Windows */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #E8644A, #F09070, #6FA8C0)" }} />
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-kipway-v2.png" alt="KipWay" style={{ height: "106px", width: "auto", mixBlendMode: "multiply" }} />
          </Link>

          <div style={{ flex: 1, minWidth: 0 }}>
            <SearchBar onSearch={handleSearch} loading={loading} compact />
          </div>

          {/* Bouton Filtres */}
          {!loading && hotels.length > 0 && (
            <button
              onClick={() => setFilterModalOpen(true)}
              style={{
                flexShrink: 0,
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "20px",
                border: activeFilters > 0 ? "1.5px solid #E8644A" : "1.5px solid #e5e7eb",
                background: activeFilters > 0 ? "#E8644A" : "#FFFFFF",
                color: activeFilters > 0 ? "#FFFFFF" : "#1E1E2E",
                fontSize: "13px", fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="20" y2="12" />
                <line x1="12" y1="18" x2="20" y2="18" />
                <circle cx="4" cy="12" r="2" fill="currentColor" stroke="none" />
                <circle cx="8" cy="18" r="2" fill="currentColor" stroke="none" />
              </svg>
              Filtres
              {activeFilters > 0 && (
                <span style={{
                  background: "#E8644A", color: "#fff",
                  borderRadius: "50%", width: "18px", height: "18px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: 700,
                }}>
                  {activeFilters}
                </span>
              )}
            </button>
          )}
        </div>

        {/* ── BANDE ROUTE + FILTRES RAPIDES ── */}
        {routeDurationMin > 0 && (
          <div style={{
            padding: "16px 20px 14px",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            flexShrink: 0,
          }}>
            {/* ── Timeline départ → durée → arrivée ── */}
            <div style={{
              background: "rgba(255,255,255,0.20)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              borderRadius: "16px",
              padding: "14px 18px 12px",
              marginBottom: "14px",
              border: "1px solid rgba(255,255,255,0.45)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)",
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
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    style={{
                      border: "none", background: "transparent", padding: 0,
                      fontSize: "10px", fontWeight: 600, color: "#6B7280",
                      outline: "none", cursor: "pointer",
                      fontFamily: "var(--font-inter), sans-serif",
                    }}
                  />
                </div>

                {/* Ligne interactive */}
                <div style={{ flex: 1, margin: "0 14px" }}>
                  {/* Durée centrée */}
                  <div style={{ textAlign: "center", fontSize: "10px", color: "#9ca3af", fontWeight: 600, letterSpacing: "0.3px", marginBottom: "5px" }}>
                    {routeDurationMin >= 60
                      ? `${Math.floor(routeDurationMin / 60)}h${String(routeDurationMin % 60).padStart(2, "0")}`
                      : `${routeDurationMin} min`}
                  </div>

                  {/* Track cliquable */}
                  <div
                    ref={timelineRef}
                    style={{ position: "relative", height: "36px", cursor: "pointer", display: "flex", alignItems: "center" }}
                    onMouseMove={(e) => {
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
                        if (cityCache.current.has(cacheKey)) {
                          setHoverCity(cityCache.current.get(cacheKey)!);
                          return;
                        }
                        fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`)
                          .then((r) => r.json())
                          .then(({ city }) => {
                            if (city) { cityCache.current.set(cacheKey, city); setHoverCity(city); }
                          }).catch(() => {});
                      }, 380);
                    }}
                    onMouseLeave={() => {
                      setHoverPct(null); setHoverCity(null);
                      if (reverseDebounceRef.current) clearTimeout(reverseDebounceRef.current);
                    }}
                    onClick={(e) => {
                      const rect = timelineRef.current!.getBoundingClientRect();
                      const pct = Math.max(2, Math.min(98, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
                      setMilestonePct((prev) => (prev !== null && Math.abs(prev - pct) < 6 ? null : pct));
                    }}
                  >
                    {/* Rail + remplissage */}
                    <div style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "#E2E8F0", borderRadius: "2px", top: "50%", transform: "translateY(-50%)" }}>
                      {milestonePct !== null && (
                        <div style={{ position: "absolute", left: 0, width: `${milestonePct}%`, height: "100%", background: "linear-gradient(to right, #E8644A, #F09070)", borderRadius: "2px", transition: "width 0.15s" }} />
                      )}
                    </div>
                    {/* Point départ */}
                    <div style={{ position: "absolute", left: 0, width: "7px", height: "7px", borderRadius: "50%", background: "#CBD5E1", top: "50%", transform: "translateY(-50%)" }} />
                    {/* Flèche fin — SVG alignée exactement sur le rail */}
                    <svg style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }} width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 5H9M9 5L5.5 1.5M9 5L5.5 8.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>

                    {/* Hover : voiture — masqué quand on survole le pin repère */}
                    {hoverPct !== null && !milestoneHovered && (
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

                    {/* Repère posé — hover → "Retirer le repère" */}
                    {milestonePct !== null && (
                      <div
                        style={{ position: "absolute", left: `${milestonePct}%`, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", zIndex: 10 }}
                        onMouseEnter={() => setMilestoneHovered(true)}
                        onMouseLeave={() => setMilestoneHovered(false)}
                        onClick={(e) => { e.stopPropagation(); setMilestonePct(null); setMilestoneHovered(false); }}
                      >
                        {/* Bulle heure → "Retirer" au hover */}
                        <div style={{
                          background: milestoneHovered ? "#1E1E2E" : "#E8644A",
                          color: "#fff", fontSize: "11px", fontWeight: 800,
                          padding: "4px 10px", borderRadius: "10px", whiteSpace: "nowrap",
                          boxShadow: milestoneHovered ? "0 3px 12px rgba(0,0,0,0.25)" : "0 3px 12px rgba(255,98,64,0.45)",
                          fontFamily: "var(--font-nunito), sans-serif", marginBottom: "2px",
                          transition: "background 0.15s, box-shadow 0.15s",
                        }}>
                          {milestoneHovered ? "✕ Retirer" : getTimeAtPct(milestonePct)}
                        </div>
                        <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `6px solid ${milestoneHovered ? "#1E1E2E" : "#E8644A"}`, marginBottom: "1px", transition: "border-top-color 0.15s" }} />
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: milestoneHovered ? "#1E1E2E" : "#E8644A", border: "2px solid #fff", boxShadow: "0 0 0 3px rgba(255,98,64,0.25)", transition: "background 0.15s" }} />
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

            {/* Toggle check-in */}
            <div
              onClick={() => setUseArrivalCheck((v) => !v)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                marginBottom: "10px", cursor: "pointer",
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.6)",
                borderRadius: "50px",
                padding: "6px 14px 6px 8px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              {/* Toggle pill */}
              <div style={{
                width: "42px", height: "24px", borderRadius: "12px",
                background: useArrivalCheck ? "#E8644A" : "#d1d5db",
                position: "relative", flexShrink: 0,
                transition: "background 0.2s",
              }}>
                <div style={{
                  position: "absolute", top: "3px",
                  left: useArrivalCheck ? "21px" : "3px",
                  width: "18px", height: "18px", borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                  transition: "left 0.2s",
                }} />
              </div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#1E1E2E", userSelect: "none" }}>
                Prendre en compte l'heure des check-in
              </span>
            </div>

            {/* Filtres rapides */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {([
                {
                  key: "ev", label: "⚡ Borne EV", active: filters.evOnly,
                  toggle: () => setFilters((f) => ({ ...f, evOnly: !f.evOnly })),
                },
                {
                  key: "24h", label: "🌙 Accueil 24h", active: filterReception24h,
                  toggle: () => setFilterReception24h((v) => !v),
                },
                {
                  key: "nodetour", label: "↗ Sans détour", active: filters.maxDetourMin === 5,
                  toggle: () => setFilters((f) => ({ ...f, maxDetourMin: f.maxDetourMin === 5 ? null : 5 })),
                },
              ] as { key: string; label: string; active: boolean; toggle: () => void }[]).map((item) => (
                <button
                  key={item.key}
                  onClick={item.toggle}
                  style={{
                    padding: "8px 16px", borderRadius: "24px",
                    border: item.active ? "1.5px solid #E8644A" : "1px solid rgba(255,255,255,0.65)",
                    background: item.active ? "#E8644A" : "rgba(255,255,255,0.50)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    color: item.active ? "#FFFFFF" : "#374151",
                    fontSize: "13px", fontWeight: 700, cursor: "pointer",
                    transition: "all 0.15s", whiteSpace: "nowrap",
                    boxShadow: item.active ? "0 3px 12px rgba(232,100,74,0.35)" : "inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Focus Point */}
        {!loading && hotels.length > 0 && (
          <FocusPointBand
            hotels={hotels}
            selectedHotelId={selectedHotel}
            onSelectHotel={toggleHotel}
          />
        )}

        {/* En-tête résultats + tag filtres actifs */}
        <div style={{
          padding: "10px 16px 6px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {loading ? (
            <p style={{ fontSize: "13px", color: "#6B7280" }}>Recherche des hôtels en cours...</p>
          ) : hotels.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#1E1E2E", fontFamily: "var(--font-nunito)", margin: 0 }}>
              <span style={{ color: "#E8644A", fontSize: "20px", fontWeight: 900 }}>{filteredHotels.length}</span>{" "}
              hôtel{filteredHotels.length !== 1 ? "s" : ""}{milestonePct !== null ? ` autour de ${getTimeAtPct(milestonePct)}` : " sur votre route"}
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
        <div className="scroll-stable" style={{ flex: 1, overflowY: "auto", padding: "0 16px 20px" }}>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredHotels.length === 0 && hotels.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "#6B7280", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#1E1E2E", marginBottom: "6px" }}>Aucun résultat</p>
              <p style={{ fontSize: "13px" }}>Essayez d&apos;élargir vos filtres</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: getGridCols(splitPct), gap: "12px" }}>
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
                    <HotelCard
                      hotel={hotel}
                      selected={selectedHotel === hotel.id}
                      onSelect={(id) => { toggleHotel(id); setExpandedHotelId(id); }}
                      estimatedArrival={useArrivalCheck ? getArrival(hotel) : null}
                    />
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
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <MapView
          route={route}
          hotels={filteredHotels}
          origin={origin}
          destination={destination}
          selectedHotelId={selectedHotel}
          onSelectHotel={toggleHotel}
          onExpandHotel={(id) => { toggleHotel(id); setExpandedHotelId(id); }}
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
  );
}
