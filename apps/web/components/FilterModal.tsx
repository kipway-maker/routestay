"use client";

import { useMemo } from "react";
import { Hotel } from "@/lib/amadeus";
import { Filters, DEFAULT_FILTERS, ALL_SOURCES, SOURCE_META, HotelSource } from "@/components/FilterBar";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (f: Filters) => void;
  hotels: Hotel[];
  filteredCount: number;
}

function buildHistogram(hotels: Hotel[], bins = 24): { counts: number[]; min: number; max: number } {
  const prices = hotels.map((h) => h.pricePerNight).filter((p): p is number => p !== null);
  if (prices.length === 0) return { counts: Array(bins).fill(0), min: 0, max: 200 };
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const counts = Array(bins).fill(0);
  prices.forEach((p) => {
    const idx = Math.min(bins - 1, Math.floor(((p - min) / (max - min)) * bins));
    counts[idx]++;
  });
  return { counts, min, max };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: "16px", fontWeight: 800, color: "#1A1A2E",
      marginBottom: "16px", fontFamily: "var(--font-nunito), sans-serif",
    }}>
      {children}
    </h3>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "#f3f4f6", margin: "24px 0" }} />;
}

function RecoTile({ emoji, label, active, onClick }: {
  emoji: string; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "8px", width: "110px", height: "90px",
        borderRadius: "14px",
        border: active ? "2px solid #1A1A2E" : "1.5px solid #e5e7eb",
        background: active ? "#f8f7f4" : "#fff",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: "26px" }}>{emoji}</span>
      <span style={{ fontSize: "12px", fontWeight: 600, color: "#1A1A2E", textAlign: "center" }}>{label}</span>
    </button>
  );
}

function PillBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px", borderRadius: "24px",
        border: active ? "2px solid #1A1A2E" : "1.5px solid #e5e7eb",
        background: active ? "#1A1A2E" : "#fff",
        color: active ? "#fff" : "#1A1A2E",
        fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

export default function FilterModal({
  isOpen, onClose, filters, onChange, hotels, filteredCount,
}: FilterModalProps) {
  const histogram = useMemo(() => buildHistogram(hotels), [hotels]);
  const maxBinCount = Math.max(...histogram.counts, 1);

  const hasActive =
    filters.maxPrice !== null ||
    filters.maxDetourMin !== null ||
    filters.minRating !== null ||
    filters.sortBy !== "default" ||
    filters.evOnly;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 2000,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(560px, calc(100vw - 40px))",
        maxHeight: "88vh",
        background: "#FFFFFF",
        borderRadius: "20px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
        zIndex: 2001,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              width: "32px", height: "32px", borderRadius: "50%",
              border: "1.5px solid #e5e7eb", background: "none",
              cursor: "pointer", fontSize: "18px", lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#1A1A2E",
            }}
          >
            ×
          </button>
          <span style={{
            fontWeight: 800, fontSize: "15px", color: "#1A1A2E",
            fontFamily: "var(--font-nunito), sans-serif",
          }}>
            Filtres
          </span>
          <div style={{ width: "32px" }} />
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* Recommandations */}
          <SectionTitle>Nos recommandations</SectionTitle>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <RecoTile
              emoji="⚡"
              label="Borne EV"
              active={filters.evOnly}
              onClick={() => onChange({ ...filters, evOnly: !filters.evOnly })}
            />
          </div>

          <Divider />

          {/* Détour */}
          <SectionTitle>Détour</SectionTitle>
          <label style={{
            display: "flex", alignItems: "flex-start", gap: "14px",
            cursor: "pointer", padding: "16px",
            background: filters.maxDetourMin === null ? "rgba(255,98,64,0.05)" : "#F8F7F4",
            borderRadius: "16px",
            border: filters.maxDetourMin === null ? "1.5px solid rgba(255,98,64,0.2)" : "1.5px solid transparent",
            transition: "all 0.15s",
          }}>
            <div style={{ position: "relative", marginTop: "2px", flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={filters.maxDetourMin === null}
                onChange={(e) => onChange({
                  ...filters,
                  maxDetourMin: e.target.checked ? null : 5,
                })}
                style={{ width: "20px", height: "20px", accentColor: "#FF6240", cursor: "pointer" }}
              />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A2E", marginBottom: "4px" }}>
                Je suis prêt à faire un détour pour des expériences mémorables
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.5" }}>
                {filters.maxDetourMin === null
                  ? "Tous les hôtels s'affichent, même ceux avec un détour."
                  : "Seuls les hôtels proches de votre route s'affichent (≤ 5 min de détour)."}
              </div>
            </div>
          </label>

          <Divider />

          {/* Prix */}
          <SectionTitle>Fourchette de prix</SectionTitle>

          {/* Histogram */}
          {histogram.counts.some((c) => c > 0) && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "64px", marginBottom: "16px" }}>
              {histogram.counts.map((count, i) => {
                const barPrice = histogram.min + (i / histogram.counts.length) * (histogram.max - histogram.min);
                const inRange = filters.maxPrice === null || barPrice <= filters.maxPrice;
                return (
                  <div key={i} style={{
                    flex: 1,
                    height: `${Math.max(0, (count / maxBinCount) * 100)}%`,
                    background: inRange ? "#FF6240" : "#e5e7eb",
                    borderRadius: "2px 2px 0 0",
                    minHeight: count > 0 ? "4px" : "0",
                    transition: "background 0.2s",
                  }} />
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {([
              { label: "Tous les prix", value: null },
              { label: "< 60 €", value: 60 },
              { label: "< 100 €", value: 100 },
              { label: "< 150 €", value: 150 },
            ] as { label: string; value: number | null }[]).map((opt) => (
              <PillBtn
                key={String(opt.value)}
                label={opt.label}
                active={filters.maxPrice === opt.value}
                onClick={() => onChange({ ...filters, maxPrice: opt.value })}
              />
            ))}
          </div>

          <Divider />

          {/* Note */}
          <SectionTitle>Note minimale</SectionTitle>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {([
              { label: "Toutes", value: null },
              { label: "★ 4+", value: 4 },
              { label: "★ 4.5+", value: 4.5 },
            ] as { label: string; value: number | null }[]).map((opt) => (
              <PillBtn
                key={String(opt.value)}
                label={opt.label}
                active={filters.minRating === opt.value}
                onClick={() => onChange({ ...filters, minRating: opt.value })}
              />
            ))}
          </div>

          <Divider />

          {/* Annonceurs */}
          <SectionTitle>Annonceurs</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {ALL_SOURCES.map((src: HotelSource) => {
              const meta = SOURCE_META[src];
              const active = filters.sources.includes(src);
              const toggle = () => {
                const next = active
                  ? filters.sources.filter((s) => s !== src)
                  : [...filters.sources, src];
                if (next.length === 0) return;
                onChange({ ...filters, sources: next });
              };
              return (
                <button
                  key={src}
                  onClick={toggle}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: "12px", cursor: "pointer",
                    border: active ? `2px solid ${meta.color}` : "2px solid #F3F4F6",
                    background: active ? `${meta.color}12` : "#FAFAFA",
                    transition: "all 0.15s", textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Pastille couleur */}
                    <div style={{
                      width: "10px", height: "10px", borderRadius: "50%",
                      background: meta.color, flexShrink: 0,
                    }}/>
                    <span style={{ fontSize: "14px", fontWeight: active ? 700 : 500, color: "#1A1A2E" }}>
                      {meta.label}
                    </span>
                  </div>
                  {/* Toggle */}
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                    border: active ? `2px solid ${meta.color}` : "2px solid #E5E7EB",
                    background: active ? meta.color : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", color: "#fff", transition: "all 0.15s",
                  }}>
                    {active && "✓"}
                  </div>
                </button>
              );
            })}
          </div>

          <Divider />

          {/* Tri */}
          <SectionTitle>Trier par</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {([
              { label: "Recommandés", value: "default" },
              { label: "Prix croissant", value: "price_asc" },
              { label: "Meilleure note", value: "rating_desc" },
              { label: "Moins de détour", value: "detour_asc" },
            ] as { label: string; value: Filters["sortBy"] }[]).map((opt, i, arr) => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...filters, sortBy: opt.value })}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 0",
                  background: "none", border: "none",
                  borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none",
                  cursor: "pointer", textAlign: "left",
                  fontSize: "14px", color: "#1A1A2E",
                  fontWeight: filters.sortBy === opt.value ? 700 : 400,
                }}
              >
                {opt.label}
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  border: filters.sortBy === opt.value ? "2px solid #1A1A2E" : "2px solid #e5e7eb",
                  background: filters.sortBy === opt.value ? "#1A1A2E" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", color: "#fff", flexShrink: 0,
                  transition: "all 0.15s",
                }}>
                  {filters.sortBy === opt.value && "✓"}
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid #f3f4f6",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, background: "#fff",
        }}>
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            disabled={!hasActive}
            style={{
              background: "none", border: "none",
              cursor: hasActive ? "pointer" : "default",
              fontSize: "13px", fontWeight: 600,
              color: hasActive ? "#1A1A2E" : "#9ca3af",
              textDecoration: hasActive ? "underline" : "none",
              padding: "8px 0",
            }}
          >
            Tout effacer
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "12px 28px", borderRadius: "12px",
              border: "none", background: "#1A1A2E",
              color: "#fff", fontSize: "14px", fontWeight: 700,
              cursor: "pointer", fontFamily: "var(--font-nunito), sans-serif",
            }}
          >
            Afficher {filteredCount} hôtel{filteredCount !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </>
  );
}
