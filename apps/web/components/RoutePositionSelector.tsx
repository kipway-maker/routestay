"use client";

import { Hotel } from "@/lib/amadeus";

interface Props {
  originName: string;
  destinationName: string;
  routeDurationMin: number;
  hotels: Hotel[];
  value: "all" | "start" | "mid" | "end";
  onChange: (v: "all" | "start" | "mid" | "end") => void;
}

const PRESETS = [
  { value: "all",   label: "Partout",     emoji: "🗺️",  range: [0, 100]  as [number, number] },
  { value: "start", label: "Au début",    emoji: "🏁",  range: [0, 33]   as [number, number] },
  { value: "mid",   label: "Mi-chemin",   emoji: "🌅",  range: [34, 66]  as [number, number] },
  { value: "end",   label: "À l'arrivée", emoji: "📍",  range: [67, 100] as [number, number] },
] as const;

function countInRange(hotels: Hotel[], min: number, max: number) {
  return hotels.filter(h => h.routePositionPct >= min && h.routePositionPct <= max).length;
}

const ZONE_STYLE: Record<string, { left: string; width: string }> = {
  all:   { left: "0%",   width: "100%" },
  start: { left: "0%",   width: "33%"  },
  mid:   { left: "33%",  width: "34%"  },
  end:   { left: "67%",  width: "33%"  },
};

export default function RoutePositionSelector({ originName, destinationName, routeDurationMin, hotels, value, onChange }: Props) {
  const zone = ZONE_STYLE[value];

  let hintText: string | null = null;
  if (value !== "all" && routeDurationMin > 0) {
    if (value === "start") hintText = `Premiers ${Math.round(routeDurationMin * 0.33)} min de route`;
    else if (value === "mid") hintText = `Autour de ${Math.round(routeDurationMin * 0.5)} min de route`;
    else if (value === "end") hintText = `Derniers ${Math.round(routeDurationMin * 0.33)} min de route`;
  }

  return (
    <div style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "14px 20px", flexShrink: 0 }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "12px" }}>
        Où faire votre étape ?
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "11px", color: "#9ca3af", flexShrink: 0, maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {originName.slice(0, 12)}
        </span>
        <div style={{ flex: 1, position: "relative", height: "6px", background: "#f3f4f6", borderRadius: "3px" }}>
          <div style={{
            position: "absolute",
            left: zone.left,
            width: zone.width,
            height: "100%",
            background: "linear-gradient(90deg, #FF6240, #FF8A40)",
            borderRadius: "3px",
            transition: "all 0.3s ease",
          }} />
        </div>
        <span style={{ fontSize: "11px", color: "#9ca3af", flexShrink: 0, maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {destinationName.slice(0, 12)}
        </span>
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
        {PRESETS.map((preset) => {
          const active = value === preset.value;
          const count = countInRange(hotels, preset.range[0], preset.range[1]);
          return (
            <button
              key={preset.value}
              onClick={() => onChange(preset.value)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "20px",
                background: active ? "#1A1A2E" : "transparent",
                color: active ? "#FFFFFF" : "#6B7280",
                border: active ? "1.5px solid #1A1A2E" : "1.5px solid #e5e7eb",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "14px" }}>{preset.emoji}</span>
              <span style={{ fontSize: "12px", fontWeight: 600 }}>{preset.label}</span>
              <span style={{
                background: active ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.07)",
                color: active ? "#fff" : "#6B7280",
                padding: "1px 7px", borderRadius: "20px",
                fontSize: "11px", fontWeight: 700,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {hintText && (
        <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "8px" }}>
          {hintText}
        </div>
      )}
    </div>
  );
}
