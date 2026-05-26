"use client";

import { Hotel } from "@/lib/amadeus";
import HotelCard from "./HotelCard";

interface HotelPanelProps {
  hotels: Hotel[];
  loading: boolean;
  selectedHotelId: string | null;
  onSelect: (id: string) => void;
}

function SkeletonCard() {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: "12px",
      padding: "14px",
      marginBottom: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <div style={{ height: "14px", background: "#e5e7eb", borderRadius: "6px", marginBottom: "8px", width: "70%" }} className="animate-pulse" />
          <div style={{ height: "12px", background: "#e5e7eb", borderRadius: "6px", marginBottom: "8px", width: "50%" }} className="animate-pulse" />
          <div style={{ height: "12px", background: "#e5e7eb", borderRadius: "6px", width: "40%" }} className="animate-pulse" />
        </div>
        <div style={{ width: "50px" }}>
          <div style={{ height: "24px", background: "#e5e7eb", borderRadius: "6px" }} className="animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function HotelPanel({ hotels, loading, selectedHotelId, onSelect }: HotelPanelProps) {
  return (
    <div style={{
      position: "fixed",
      right: 0,
      top: 0,
      height: "100vh",
      width: "384px",
      background: "#F8F7F4",
      borderLeft: "1px solid rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      zIndex: 50,
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 16px 14px",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        background: "#FFFFFF",
        flexShrink: 0,
      }}>
        <h2 style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontWeight: 700,
          fontSize: "16px",
          color: "#1A1A2E",
        }}>
          {loading ? (
            "Recherche des hôtels..."
          ) : hotels.length > 0 ? (
            <>
              <span style={{ color: "#FF6240" }}>{hotels.length}</span> hôtel{hotels.length > 1 ? "s" : ""} trouvé{hotels.length > 1 ? "s" : ""}
            </>
          ) : (
            "Hôtels sur votre route"
          )}
        </h2>
        {!loading && hotels.length > 0 && (
          <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
            Cliquez sur un hôtel pour le voir sur la carte
          </p>
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px 16px",
      }}>
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : hotels.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "300px",
            textAlign: "center",
            color: "#6B7280",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏨</div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A2E", marginBottom: "8px" }}>
              Aucun hôtel trouvé
            </p>
            <p style={{ fontSize: "13px", lineHeight: 1.5 }}>
              Saisissez un itinéraire pour voir les hôtels disponibles le long de votre route.
            </p>
          </div>
        ) : (
          hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              selected={selectedHotelId === hotel.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
