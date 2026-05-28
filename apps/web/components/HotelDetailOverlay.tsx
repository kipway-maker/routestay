"use client";

import { useState } from "react";
import { Hotel } from "@/lib/amadeus";

interface Props {
  hotel: Hotel;
  estimatedArrival: string | null;
  departureDate: string | null; // "YYYY-MM-DD"
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

function addDayToDate(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function HotelDetailOverlay({ hotel, estimatedArrival, departureDate, onClose }: Props) {
  const photos = hotel.images?.length ? hotel.images : [hotel.imageUrl];
  const [photoIdx, setPhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const isLate = !!(
    estimatedArrival &&
    hotel.checkinDeadline &&
    timeToMin(estimatedArrival) > timeToMin(hotel.checkinDeadline)
  );

  // Build Booking URL with checkin/checkout if date is set
  let bookingUrl = hotel.bookingUrl || "";
  if (!bookingUrl) {
    const baseSearch = `https://www.booking.com/search.html?ss=${encodeURIComponent(hotel.name + ", " + hotel.city)}`;
    if (departureDate) {
      const checkout = addDayToDate(departureDate);
      bookingUrl = `${baseSearch}&checkin=${departureDate}&checkout=${checkout}&group_adults=1&no_rooms=1`;
    } else {
      bookingUrl = baseSearch;
    }
  }

  async function handleShare() {
    const arrivalPart = estimatedArrival ? ` nous fait arriver à ${estimatedArrival}` : "";
    const shareText = `[Kipway] J'ai trouvé un hôtel sur notre route ! L'hôtel ${hotel.name} à ${hotel.city}${arrivalPart} 👉 Voir l'hôtel : ${bookingUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `[Kipway] ${hotel.name}`, text: shareText });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

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
          WebkitBackdropFilter: "blur(2px)",
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

        {/* ── CAROUSEL ── */}
        <div style={{ position: "relative", height: "260px", flexShrink: 0, background: "#f3f4f6" }}>
          <img
            key={photoIdx}
            src={photos[photoIdx]}
            alt={hotel.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.2s" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop"; }}
          />

          {/* Prev / Next arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                style={{
                  position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
                  width: "34px", height: "34px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.88)", border: "none", cursor: "pointer",
                  fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)", color: "#1E1E2E",
                }}
              >‹</button>
              <button
                onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                style={{
                  position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                  width: "34px", height: "34px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.88)", border: "none", cursor: "pointer",
                  fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)", color: "#1E1E2E",
                }}
              >›</button>

              {/* Dots */}
              <div style={{
                position: "absolute", bottom: "48px", left: "50%", transform: "translateX(-50%)",
                display: "flex", gap: "6px",
              }}>
                {photos.map((_, k) => (
                  <button
                    key={k}
                    onClick={() => setPhotoIdx(k)}
                    style={{
                      width: k === photoIdx ? "18px" : "6px",
                      height: "6px",
                      borderRadius: "3px",
                      background: k === photoIdx ? "#E8644A" : "rgba(255,255,255,0.7)",
                      border: "none", cursor: "pointer", padding: 0,
                      transition: "width 0.2s",
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Top-right buttons: close + share */}
          <div style={{ position: "absolute", top: "14px", right: "14px", display: "flex", gap: "8px" }}>
            <button
              onClick={handleShare}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "rgba(255,255,255,0.92)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
              title={copied ? "Copié !" : "Partager"}
            >
              {copied ? "✓" : "⬆"}
            </button>
            <button
              onClick={onClose}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "rgba(255,255,255,0.92)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", color: "#1E1E2E",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >×</button>
          </div>

          {/* EV Badge */}
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
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#1E1E2E" }}>
                {hotel.pricePerNight} €
              </span>
              <span style={{ fontSize: "12px", color: "#6B7280" }}> /nuit</span>
            </div>
          )}
        </div>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* Name + city */}
          <div style={{
            fontSize: "22px", fontWeight: 800, color: "#1E1E2E",
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
              <span style={{ fontSize: "18px", fontWeight: 800, color: "#6FA8C0" }}>
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
                <span style={{ fontSize: "18px", fontWeight: 800, color: isLate ? "#D97706" : "#1E1E2E" }}>
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

            {/* Date de nuit */}
            {departureDate && (
              <div style={{
                background: "#F0F7FF", borderRadius: "14px", padding: "14px",
                display: "flex", flexDirection: "column", gap: "4px",
              }}>
                <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>Nuit du</span>
                <span style={{ fontSize: "15px", fontWeight: 800, color: "#1E1E2E" }}>
                  {new Date(departureDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
              </div>
            )}
          </div>

          {/* CTA Booking */}
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              width: "100%", padding: "16px",
              background: "#E8644A", color: "#FFFFFF",
              borderRadius: "16px", border: "none",
              fontSize: "15px", fontWeight: 800,
              textDecoration: "none",
              fontFamily: "var(--font-nunito), sans-serif",
              boxShadow: "0 4px 16px rgba(255,98,64,0.35)",
              transition: "all 0.15s",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#e8502e")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#E8644A")}
          >
            {departureDate ? `Voir les dispo du ${new Date(departureDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} →` : "Voir l'hôtel →"}
          </a>
        </div>
      </div>
    </>
  );
}
