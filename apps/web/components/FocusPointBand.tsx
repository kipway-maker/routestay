"use client";

import { useState, useRef, useEffect } from "react";
import { Hotel } from "@/lib/amadeus";
import { haversineKm } from "@/lib/geo";

interface Place { name: string; lat: number; lng: number; }

interface FocusPointBandProps {
  hotels: Hotel[];
  selectedHotelId: string | null;
  onSelectHotel: (id: string) => void;
}

function FocusCard({
  hotel, distanceToFocusKm, selected, onSelect,
}: {
  hotel: Hotel; distanceToFocusKm: number; selected: boolean; onSelect: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onSelect(hotel.id)}
      style={{
        flexShrink: 0,
        width: "220px",
        scrollSnapAlign: "start",
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: selected ? "2px solid #FF6240" : "1px solid rgba(255,255,255,0.6)",
        borderRadius: "18px",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: selected ? "0 6px 24px rgba(255,98,64,0.18)" : "0 2px 12px rgba(0,0,0,0.08)",
        transition: "all 0.18s ease",
        transform: selected ? "translateY(-3px)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.13)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
          (e.currentTarget as HTMLDivElement).style.transform = "none";
        }
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "130px", background: "#f3f4f6" }}>
        <img
          src={hotel.imageUrl}
          alt={hotel.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop"; }}
        />
        {hotel.pricePerNight && (
          <div style={{
            position: "absolute", bottom: "8px", right: "8px",
            background: "rgba(255,255,255,0.96)", borderRadius: "8px",
            padding: "3px 9px", fontSize: "13px", fontWeight: 700,
            color: "#1A1A2E", boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          }}>
            {hotel.pricePerNight} €
          </div>
        )}
        {hotel.hasEVCharger && (
          <div style={{
            position: "absolute", top: "8px", left: "8px",
            background: "#06D6A0", color: "#fff",
            fontSize: "10px", fontWeight: 700,
            padding: "2px 7px", borderRadius: "20px",
          }}>⚡ EV</div>
        )}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{
          fontSize: "13px", fontWeight: 700, color: "#1A1A2E",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          fontFamily: "var(--font-nunito), sans-serif", marginBottom: "3px",
        }}>
          {hotel.name}
        </div>
        <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>
          {hotel.city}
          {hotel.rating && (
            <span style={{ marginLeft: "6px" }}>★ <strong style={{ color: "#1A1A2E" }}>{hotel.rating}</strong></span>
          )}
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "4px",
          fontSize: "11px", fontWeight: 700, color: "#FF6240",
          background: "rgba(255,98,64,0.08)",
          padding: "3px 8px", borderRadius: "20px",
        }}>
          🎯 {Math.round(distanceToFocusKm * 10) / 10} km
        </div>
      </div>
    </div>
  );
}

export default function FocusPointBand({ hotels, selectedHotelId, onSelectHotel }: FocusPointBandProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusPoint, setFocusPoint] = useState<Place | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        const data: Place[] = await res.json();
        setSuggestions(data);
        setOpen(true);
      } catch { /* ignore */ }
    }, 400);
  }

  function handleSelect(place: Place) {
    setFocusPoint(place);
    setQuery(place.name.split(",")[0]);
    setSuggestions([]);
    setOpen(false);
  }

  function clearFocus() {
    setFocusPoint(null);
    setQuery("");
    setSuggestions([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleToggle() {
    setIsOpen((v) => {
      if (!v) setTimeout(() => inputRef.current?.focus(), 120);
      return !v;
    });
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const focusHotels = focusPoint
    ? [...hotels]
        .map((h) => ({ hotel: h, dist: haversineKm(focusPoint.lat, focusPoint.lng, h.lat, h.lng) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 12)
    : [];

  function scrollBy(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div style={{
      borderBottom: "1px solid rgba(0,0,0,0.07)",
      flexShrink: 0,
      background: isOpen
        ? focusPoint
          ? "linear-gradient(135deg, #FFF6F3 0%, #FFFAF7 100%)"
          : "#FAFAFA"
        : "#FFFFFF",
      transition: "background 0.25s ease",
    }}>

      {/* ── Header cliquable ── */}
      <button
        onClick={handleToggle}
        style={{
          width: "100%", border: "none", background: "transparent",
          cursor: "pointer", padding: "14px 20px",
          display: "flex", alignItems: "center", gap: "14px",
          textAlign: "left",
        }}
      >
        {/* Icône */}
        <div style={{
          width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
          background: focusPoint
            ? "linear-gradient(135deg, #FF6240, #FF8A6E)"
            : "rgba(255,98,64,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px",
          boxShadow: focusPoint ? "0 4px 14px rgba(255,98,64,0.3)" : "none",
          transition: "all 0.2s",
        }}>
          🎯
        </div>

        {/* Texte */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "14px", fontWeight: 800, color: focusPoint ? "#FF6240" : "#1A1A2E",
            fontFamily: "var(--font-nunito), sans-serif", lineHeight: 1.2,
          }}>
            {focusPoint
              ? `Autour de ${focusPoint.name.split(",")[0]}`
              : "Explorer une étape"}
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
            {focusPoint
              ? `${focusHotels.length} hôtel${focusHotels.length !== 1 ? "s" : ""} à proximité`
              : "Voir les hôtels autour d'un point précis de votre route"}
          </div>
        </div>

        {/* Chevron */}
        <div style={{
          fontSize: "18px", color: "#9ca3af",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.22s ease",
          flexShrink: 0,
        }}>
          ⌄
        </div>
      </button>

      {/* ── Contenu dépliable ── */}
      {isOpen && (
        <div style={{ paddingBottom: "16px" }}>

          {/* Barre de recherche */}
          <div style={{ padding: "0 20px 16px", position: "relative" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
              border: inputFocused ? "1.5px solid #FF6240" : "1.5px solid #e5e7eb",
              borderRadius: "14px",
              padding: "11px 16px",
              boxShadow: inputFocused
                ? "0 0 0 3px rgba(255,98,64,0.1)"
                : "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                onFocus={() => { setInputFocused(true); suggestions.length > 0 && setOpen(true); }}
                onBlur={() => setInputFocused(false)}
                placeholder="Ex : Chambéry, Lyon, Dijon..."
                style={{
                  flex: 1, border: "none", outline: "none",
                  fontSize: "14px", fontWeight: 500,
                  color: "#1A1A2E", background: "transparent",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              />
              {focusPoint && (
                <button
                  onClick={clearFocus}
                  style={{
                    flexShrink: 0, padding: "4px 10px",
                    borderRadius: "20px", background: "rgba(0,0,0,0.06)",
                    border: "none", cursor: "pointer",
                    fontSize: "12px", fontWeight: 600, color: "#6B7280",
                  }}
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Dropdown suggestions */}
            {open && suggestions.length > 0 && (
              <div ref={dropdownRef} style={{
                position: "absolute", top: "calc(100% - 4px)", left: "20px", right: "20px",
                background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: "14px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                zIndex: 500, overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.06)",
              }}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={() => handleSelect(s)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "10px",
                      width: "100%", padding: "11px 16px",
                      textAlign: "left", border: "none", background: "none",
                      cursor: "pointer",
                      borderBottom: i < suggestions.length - 1 ? "1px solid #f3f4f6" : "none",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FFF5F3")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "none")}
                  >
                    <span style={{ fontSize: "14px", marginTop: "1px", flexShrink: 0 }}>📍</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A1A2E" }}>
                        {s.name.split(",")[0]}
                      </div>
                      <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "1px" }}>
                        {s.name.split(",").slice(1, 3).join(",")}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card slider */}
          {focusPoint && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => scrollBy(-240)}
                style={{
                  position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)",
                  zIndex: 10, width: "36px", height: "36px", borderRadius: "50%",
                  border: "1.5px solid #e5e7eb", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", color: "#1A1A2E", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FF6240"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.color = "#1A1A2E"; }}
              >‹</button>

              <div
                ref={scrollRef}
                style={{
                  display: "flex", gap: "12px",
                  paddingLeft: "52px", paddingRight: "52px",
                  overflowX: "scroll", scrollSnapType: "x mandatory",
                  scrollbarWidth: "none",
                } as React.CSSProperties}
              >
                {focusHotels.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "#6B7280", paddingTop: "4px", whiteSpace: "nowrap" }}>
                    Aucun hôtel à proximité.
                  </p>
                ) : (
                  focusHotels.map(({ hotel, dist }) => (
                    <FocusCard
                      key={hotel.id}
                      hotel={hotel}
                      distanceToFocusKm={dist}
                      selected={selectedHotelId === hotel.id}
                      onSelect={onSelectHotel}
                    />
                  ))
                )}
              </div>

              <button
                onClick={() => scrollBy(240)}
                style={{
                  position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                  zIndex: 10, width: "36px", height: "36px", borderRadius: "50%",
                  border: "1.5px solid #e5e7eb", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", color: "#1A1A2E", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FF6240"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.color = "#1A1A2E"; }}
              >›</button>
            </div>
          )}

          {/* État vide — pas encore de focus point */}
          {!focusPoint && (
            <div style={{
              margin: "0 20px",
              padding: "20px",
              background: "rgba(255,98,64,0.04)",
              borderRadius: "14px",
              border: "1.5px dashed rgba(255,98,64,0.2)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🗺️</div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#1A1A2E", marginBottom: "4px" }}>
                Tapez une ville ou une étape
              </p>
              <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                On affiche les hôtels dans un rayon de 50 km autour de ce point
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
