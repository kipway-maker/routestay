"use client";

import { Hotel } from "@/lib/amadeus";

interface HotelCardProps {
  hotel: Hotel;
  selected: boolean;
  onSelect: (id: string) => void;
  estimatedArrival?: string | null; // "HH:MM"
}

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function HotelCard({ hotel, selected, onSelect, estimatedArrival }: HotelCardProps) {
  const isLate = !!(
    estimatedArrival &&
    hotel.checkinDeadline &&
    timeToMin(estimatedArrival) > timeToMin(hotel.checkinDeadline)
  );
  const isTight = !isLate && !!(
    estimatedArrival &&
    hotel.checkinDeadline &&
    timeToMin(hotel.checkinDeadline) - timeToMin(estimatedArrival) <= 60
  );

  return (
    <div
      onClick={() => onSelect(hotel.id)}
      style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        border: selected ? "2px solid #FF6240" : isTight ? "2px solid #F59E0B" : "2px solid transparent",
        boxShadow: selected ? "0 4px 20px rgba(255,98,64,0.2)" : "0 2px 8px rgba(0,0,0,0.07)",
        transition: "all 0.18s ease",
        transform: selected ? "translateY(-2px)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!selected) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.13)";
      }}
      onMouseLeave={(e) => {
        if (!selected) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)";
      }}
    >
      {/* Photo */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "66%", background: "#f3f4f6" }}>
        <img
          src={hotel.imageUrl}
          alt={hotel.name}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop"; }}
        />
        {/* Badges photo — empilés verticalement à gauche */}
        <div style={{ position: "absolute", top: "8px", left: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {hotel.hasEVCharger && (
            <span style={{
              background: "#06D6A0", color: "#fff",
              fontSize: "10px", fontWeight: 700,
              padding: "3px 8px", borderRadius: "20px",
              boxShadow: "0 2px 6px rgba(6,214,160,0.4)",
              display: "inline-block",
            }}>⚡ EV</span>
          )}
          {!hotel.checkinDeadline && (
            <span style={{
              background: "rgba(26,26,46,0.75)", color: "#fff",
              fontSize: "10px", fontWeight: 700,
              padding: "3px 8px", borderRadius: "20px",
              backdropFilter: "blur(4px)",
              display: "inline-block",
            }}>🌙 24h</span>
          )}
        </div>
        {hotel.pricePerNight && (
          <div style={{
            position: "absolute", bottom: "8px", right: "8px",
            background: "rgba(255,255,255,0.95)", borderRadius: "8px",
            padding: "3px 8px", fontSize: "13px", fontWeight: 700, color: "#1A1A2E",
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          }}>
            {hotel.pricePerNight} €
          </div>
        )}
      </div>

      {/* Infos */}
      <div style={{ padding: "11px 13px 13px" }}>
        <div style={{
          fontSize: "14px", fontWeight: 700, color: "#1A1A2E",
          marginBottom: "2px", whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis",
          fontFamily: "var(--font-nunito), sans-serif",
        }}>
          {hotel.name}
        </div>
        <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "8px" }}>
          {hotel.city}
          {hotel.rating && (
            <span style={{ marginLeft: "8px" }}>
              ★ <strong style={{ color: "#1A1A2E" }}>{hotel.rating}</strong>
            </span>
          )}
        </div>

        {/* Détour en temps */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "7px", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "12px", color: "#00B4D8", fontWeight: 700,
            background: "rgba(0,180,216,0.08)", padding: "3px 9px", borderRadius: "20px",
          }}>
            {hotel.detourMinutes === 0 ? "Sur la route" : `+${hotel.detourMinutes} min`}
          </span>
          {hotel.hasEVCharger && (
            <span style={{
              fontSize: "11px", color: "#06D6A0", fontWeight: 600,
              background: "rgba(6,214,160,0.08)", padding: "3px 8px", borderRadius: "20px",
            }}>
              +20 min recharge EV
            </span>
          )}
        </div>

        {/* Check-in info */}
        {hotel.checkinDeadline && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: isLate ? "rgba(239,68,68,0.06)" : isTight ? "rgba(245,158,11,0.08)" : "rgba(0,0,0,0.03)",
            borderRadius: "8px", padding: "5px 9px",
            border: isLate ? "1px solid rgba(239,68,68,0.2)" : isTight ? "1px solid rgba(245,158,11,0.25)" : "1px solid transparent",
          }}>
            <span style={{ fontSize: "11px", color: "#6B7280" }}>
              Check-in max&nbsp;<strong style={{ color: "#1A1A2E" }}>{hotel.checkinDeadline}</strong>
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

        {/* Prix */}
        {hotel.pricePerNight && (
          <div style={{ marginTop: "8px", fontSize: "13px", color: "#1A1A2E" }}>
            <span style={{ fontWeight: 700 }}>{hotel.pricePerNight} €</span>
            <span style={{ color: "#6B7280" }}> / nuit</span>
          </div>
        )}
      </div>
    </div>
  );
}
