"use client";

import { useRef, useState, useCallback } from "react";
import { Hotel } from "@/lib/amadeus";

interface HotelCardProps {
  hotel: Hotel;
  selected: boolean;
  onSelect: (id: string) => void;
  estimatedArrival?: string | null;
}

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// ── Glass pill générique ───────────────────────────────────────
function GlassPill({
  children, color = "rgba(255,255,255,0.25)", border = "rgba(255,255,255,0.5)",
  textColor = "#1E1E2E",
}: {
  children: React.ReactNode;
  color?: string;
  border?: string;
  textColor?: string;
}) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      background: color,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: `1px solid ${border}`,
      borderRadius: "50px",
      padding: "3px 10px",
      fontSize: "11px", fontWeight: 700, color: textColor,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

export default function HotelCard({ hotel, selected, onSelect, estimatedArrival }: HotelCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spot, setSpot] = useState({ x: 50, y: 50, on: false });

  const isLate  = !!(estimatedArrival && hotel.checkinDeadline && timeToMin(estimatedArrival) > timeToMin(hotel.checkinDeadline));
  const isTight = !isLate && !!(estimatedArrival && hotel.checkinDeadline && timeToMin(hotel.checkinDeadline) - timeToMin(estimatedArrival) <= 60);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = cardRef.current!.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const cx = r.width / 2,       cy = r.height / 2;
    setTilt({ x: -((my - cy) / cy) * 4, y: ((mx - cx) / cx) * 5 });
    setSpot({ x: (mx / r.width) * 100, y: (my / r.height) * 100, on: true });
  }, []);

  const onLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setSpot({ x: 50, y: 50, on: false });
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(hotel.id)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(36px)",
        WebkitBackdropFilter: "blur(36px)",
        borderRadius: "18px",
        overflow: "hidden",
        cursor: "pointer",
        border: selected
          ? "1.5px solid rgba(232,100,74,0.7)"
          : isTight
          ? "1.5px solid rgba(245,158,11,0.6)"
          : "1px solid rgba(255,255,255,0.38)",
        boxShadow: selected
          ? "0 16px 48px rgba(232,100,74,0.30), inset 0 1px 0 rgba(255,255,255,0.5)"
          : "0 4px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.45)",
        transform: selected
          ? `perspective(900px) rotateX(${tilt.x * 0.5}deg) rotateY(${tilt.y * 0.5}deg) translateY(-4px) scale(1.02)`
          : `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: spot.on ? "box-shadow 0.15s, border 0.15s" : "all 0.35s cubic-bezier(0.23,1,0.32,1)",
        willChange: "transform",
      }}
    >
      {/* ── Spotlight qui suit le curseur ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        pointerEvents: "none", borderRadius: "18px",
        background: spot.on
          ? `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 45%, transparent 70%)`
          : "none",
        transition: "background 0.08s",
      }} />

      {/* ── Barre sélection ── */}
      {selected && (
        <div style={{ height: "3px", background: "linear-gradient(90deg,#E8644A,#F09070,#6FA8C0)", position: "relative", zIndex: 3 }} />
      )}

      {/* ── Photo ── */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "60%" }}>
        <img
          src={hotel.imageUrl}
          alt={hotel.name}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop"; }}
        />
        {/* Overlay gradient bas */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)", pointerEvents: "none" }} />

        {/* Badges haut-gauche */}
        <div style={{ position: "absolute", top: "8px", left: "8px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 1 }}>
          {hotel.hasEVCharger && (
            <GlassPill color="rgba(6,214,160,0.30)" border="rgba(6,214,160,0.5)" textColor="#00A878">
              ⚡ EV
            </GlassPill>
          )}
          {!hotel.checkinDeadline && (
            <GlassPill color="rgba(30,30,46,0.45)" border="rgba(255,255,255,0.3)" textColor="#fff">
              🌙 24h
            </GlassPill>
          )}
        </div>

        {/* Prix bas-droit sur photo */}
        {hotel.pricePerNight && (
          <div style={{
            position: "absolute", bottom: "10px", right: "10px", zIndex: 1,
            background: selected ? "rgba(232,100,74,0.88)" : "rgba(255,255,255,0.22)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: selected ? "1px solid rgba(232,100,74,0.6)" : "1px solid rgba(255,255,255,0.55)",
            borderRadius: "12px",
            padding: "5px 12px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
          }}>
            <span style={{ fontSize: "14px", fontWeight: 900, color: selected ? "#fff" : "#fff", letterSpacing: "-0.3px" }}>
              {hotel.pricePerNight} €
            </span>
          </div>
        )}
      </div>

      {/* ── Infos ── */}
      <div style={{ padding: "12px 13px 14px", position: "relative", zIndex: 1 }}>

        {/* Nom */}
        <div style={{
          fontSize: "14px", fontWeight: 800, color: "#1E1E2E",
          marginBottom: "3px", whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis",
          fontFamily: "var(--font-nunito), sans-serif",
        }}>
          {hotel.name}
        </div>

        {/* Ville + note */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
          <span style={{ fontSize: "11px", color: "rgba(30,30,46,0.55)", fontWeight: 500 }}>
            📍 {hotel.city}
          </span>
          {hotel.rating && (
            <GlassPill color="rgba(255,209,102,0.22)" border="rgba(255,209,102,0.45)" textColor="#A07000">
              ★ {hotel.rating}
            </GlassPill>
          )}
        </div>

        {/* Badges détour + EV */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
          <GlassPill color="rgba(111,168,192,0.20)" border="rgba(111,168,192,0.45)" textColor="#2A7090">
            {hotel.detourMinutes === 0 ? "🛣 Sur la route" : `↗ +${hotel.detourMinutes} min`}
          </GlassPill>
          {hotel.hasEVCharger && (
            <GlassPill color="rgba(6,214,160,0.15)" border="rgba(6,214,160,0.35)" textColor="#008060">
              ⚡ +20 min recharge
            </GlassPill>
          )}
        </div>

        {/* Check-in */}
        {hotel.checkinDeadline && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: isLate
              ? "rgba(239,68,68,0.12)"
              : isTight
              ? "rgba(245,158,11,0.12)"
              : "rgba(255,255,255,0.20)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: isLate
              ? "1px solid rgba(239,68,68,0.30)"
              : isTight
              ? "1px solid rgba(245,158,11,0.30)"
              : "1px solid rgba(255,255,255,0.40)",
            borderRadius: "10px", padding: "5px 10px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
          }}>
            <span style={{ fontSize: "11px", color: "rgba(30,30,46,0.6)" }}>
              Check-in max <strong style={{ color: "#1E1E2E" }}>{hotel.checkinDeadline}</strong>
            </span>
            {estimatedArrival && (
              <span style={{
                fontSize: "11px", fontWeight: 700,
                color: isLate ? "#EF4444" : isTight ? "#F59E0B" : "#06D6A0",
              }}>
                {isLate ? "✕" : isTight ? "⚠" : "✓"} ~{estimatedArrival}
              </span>
            )}
          </div>
        )}

        {/* Prix texte bas */}
        {hotel.pricePerNight && (
          <div style={{ marginTop: "9px", display: "flex", alignItems: "baseline", gap: "4px" }}>
            <span style={{
              fontSize: "16px", fontWeight: 900, color: "#1E1E2E",
              fontFamily: "var(--font-nunito), sans-serif",
            }}>{hotel.pricePerNight} €</span>
            <span style={{ fontSize: "11px", color: "rgba(30,30,46,0.45)", fontWeight: 500 }}>/ nuit</span>
          </div>
        )}
      </div>
    </div>
  );
}
