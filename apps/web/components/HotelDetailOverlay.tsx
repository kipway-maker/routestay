"use client";

import { Hotel } from "@/lib/amadeus";

interface Props {
  hotel: Hotel;
  estimatedArrival: string | null;
  onClose: () => void;
}

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function HotelDetailOverlay({ hotel, estimatedArrival, onClose }: Props) {
  const isLate = !!(
    estimatedArrival &&
    hotel.checkinDeadline &&
    timeToMin(estimatedArrival) > timeToMin(hotel.checkinDeadline)
  );

  const bookingUrl = hotel.bookingUrl ||
    `https://www.booking.com/search.html?ss=${encodeURIComponent(hotel.name + ", " + hotel.city)}`;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 3000,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(480px, calc(100vw - 40px))",
        maxHeight: "90vh",
        background: "#FFFFFF",
        borderRadius: "24px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        zIndex: 3001,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>

        {/* Photo */}
        <div style={{ position: "relative", height: "260px", flexShrink: 0, background: "#f3f4f6" }}>
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop"; }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "14px", right: "14px",
              width: "36px", height: "36px", borderRadius: "50%",
              background: "rgba(255,255,255,0.92)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", color: "#1A1A2E",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            ×
          </button>

          {/* Badges */}
          <div style={{ position: "absolute", top: "14px", left: "14px", display: "flex", gap: "6px" }}>
            {hotel.hasEVCharger && (
              <span style={{
                background: "#06D6A0", color: "#fff",
                fontSize: "11px", fontWeight: 700,
                padding: "4px 10px", borderRadius: "20px",
              }}>⚡ Borne EV</span>
            )}
          </div>

          {/* Price bubble */}
          {hotel.pricePerNight && (
            <div style={{
              position: "absolute", bottom: "14px", right: "14px",
              background: "rgba(255,255,255,0.96)", borderRadius: "12px",
              padding: "6px 12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#1A1A2E" }}>
                {hotel.pricePerNight} €
              </span>
              <span style={{ fontSize: "12px", color: "#6B7280" }}> /nuit</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* Name + city */}
          <div style={{
            fontSize: "22px", fontWeight: 800, color: "#1A1A2E",
            fontFamily: "var(--font-nunito), sans-serif", marginBottom: "4px",
          }}>
            {hotel.name}
          </div>
          <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>📍 {hotel.city}</span>
            {hotel.rating && (
              <span style={{
                background: "#FFF8E1", borderRadius: "8px",
                padding: "2px 8px", fontSize: "13px", fontWeight: 700, color: "#F59E0B",
              }}>
                ★ {hotel.rating}
              </span>
            )}
          </div>

          {/* Info cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            <div style={{
              background: "#F8F7F4", borderRadius: "14px", padding: "14px",
              display: "flex", flexDirection: "column", gap: "4px",
            }}>
              <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>Détour</span>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "#00B4D8" }}>
                {hotel.detourMinutes === 0 ? "Sur la route" : `+${hotel.detourMinutes} min`}
              </span>
            </div>

            {hotel.checkinDeadline && (
              <div style={{
                background: isLate ? "rgba(255,209,102,0.15)" : "#F8F7F4",
                borderRadius: "14px", padding: "14px",
                border: isLate ? "1px solid rgba(255,209,102,0.5)" : "none",
                display: "flex", flexDirection: "column", gap: "4px",
              }}>
                <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  Check-in max
                </span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: isLate ? "#D97706" : "#1A1A2E" }}>
                  {hotel.checkinDeadline}
                </span>
                {estimatedArrival && (
                  <span style={{ fontSize: "11px", color: isLate ? "#D97706" : "#06D6A0", fontWeight: 600 }}>
                    {isLate ? "⚠️" : "✓"} Arrivée ~{estimatedArrival}
                  </span>
                )}
              </div>
            )}

            {hotel.hasEVCharger && (
              <div style={{
                background: "rgba(6,214,160,0.08)", borderRadius: "14px", padding: "14px",
                display: "flex", flexDirection: "column", gap: "4px",
              }}>
                <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>Recharge EV</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#06D6A0" }}>+20 min</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              width: "100%", padding: "16px",
              background: "#FF6240", color: "#FFFFFF",
              borderRadius: "16px", border: "none",
              fontSize: "15px", fontWeight: 800,
              textDecoration: "none",
              fontFamily: "var(--font-nunito), sans-serif",
              boxShadow: "0 4px 16px rgba(255,98,64,0.35)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#e8502e")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#FF6240")}
          >
            Voir l&apos;hôtel →
          </a>
        </div>
      </div>
    </>
  );
}
