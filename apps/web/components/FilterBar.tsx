"use client";

export interface Filters {
  maxPrice: number | null;
  maxDetourMin: number | null;
  minRating: number | null;
  sortBy: "default" | "price_asc" | "rating_desc" | "detour_asc";
  evOnly: boolean;
  accommodationType: "hotel" | "bb" | "auberge" | "camping" | null;
  routePosition: "all" | "start" | "mid" | "end";
}

export const DEFAULT_FILTERS: Filters = {
  maxPrice: null,
  maxDetourMin: null,
  minRating: null,
  sortBy: "default",
  evOnly: false,
  accommodationType: null,
  routePosition: "all",
};

const MAX_DETOUR_MIN = 60; // slider max

function PillGroup({ label, options, active, onChange }: {
  label: string;
  options: { label: string; value: string | number | null }[];
  active: string | number | null;
  onChange: (v: string | number | null) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
      <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
      {options.map((opt) => {
        const isActive = active === opt.value;
        return (
          <button key={String(opt.value)} onClick={() => onChange(opt.value)} style={{
            padding: "5px 12px", borderRadius: "20px",
            border: isActive ? "1.5px solid #FF6240" : "1.5px solid #e5e7eb",
            background: isActive ? "#FF6240" : "#FFFFFF",
            color: isActive ? "#FFFFFF" : "#1A1A2E",
            fontSize: "12px", fontWeight: 600, cursor: "pointer",
            whiteSpace: "nowrap", transition: "all 0.15s",
          }}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface FilterBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  totalCount: number;
  filteredCount: number;
}

export default function FilterBar({ filters, onChange, totalCount, filteredCount }: FilterBarProps) {
  const sliderVal = filters.maxDetourMin ?? MAX_DETOUR_MIN;
  const isMaxed = sliderVal >= MAX_DETOUR_MIN;
  const hasActive = filters.maxPrice !== null || !isMaxed || filters.minRating !== null
    || filters.sortBy !== "default" || filters.evOnly;

  return (
    <div style={{ padding: "10px 20px 12px", borderBottom: "1px solid rgba(0,0,0,0.07)", background: "#FFFFFF", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "2px" }}>

        {/* ── Slider détour en temps ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0, minWidth: "200px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280" }}>0 détour</span>
            <span style={{
              fontSize: "12px", fontWeight: 700,
              color: isMaxed ? "#6B7280" : "#FF6240",
            }}>
              {isMaxed ? "Expérience" : `≤ ${sliderVal} min`}
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF6240" }}>Expérience</span>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type="range" min={0} max={MAX_DETOUR_MIN} step={5}
              value={sliderVal}
              onChange={(e) => {
                const v = Number(e.target.value);
                onChange({ ...filters, maxDetourMin: v >= MAX_DETOUR_MIN ? null : v });
              }}
              style={{
                width: "100%", accentColor: "#FF6240",
                height: "4px", cursor: "pointer",
              }}
            />
          </div>
        </div>

        <div style={{ width: "1px", height: "28px", background: "#e5e7eb", flexShrink: 0 }} />

        {/* Prix */}
        <PillGroup
          label="Prix"
          options={[
            { label: "Tous", value: null },
            { label: "< 60 €", value: 60 },
            { label: "< 100 €", value: 100 },
            { label: "< 150 €", value: 150 },
          ]}
          active={filters.maxPrice}
          onChange={(v) => onChange({ ...filters, maxPrice: v as number | null })}
        />

        <div style={{ width: "1px", height: "28px", background: "#e5e7eb", flexShrink: 0 }} />

        {/* Note */}
        <PillGroup
          label="Note"
          options={[
            { label: "Tous", value: null },
            { label: "4+", value: 4 },
            { label: "4.5+", value: 4.5 },
          ]}
          active={filters.minRating}
          onChange={(v) => onChange({ ...filters, minRating: v as number | null })}
        />

        <div style={{ width: "1px", height: "28px", background: "#e5e7eb", flexShrink: 0 }} />

        {/* EV */}
        <button
          onClick={() => onChange({ ...filters, evOnly: !filters.evOnly })}
          style={{
            padding: "5px 12px", borderRadius: "20px", flexShrink: 0,
            border: filters.evOnly ? "1.5px solid #06D6A0" : "1.5px solid #e5e7eb",
            background: filters.evOnly ? "#06D6A0" : "#FFFFFF",
            color: filters.evOnly ? "#FFFFFF" : "#1A1A2E",
            fontSize: "12px", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "5px",
            transition: "all 0.15s",
          }}
        >
          ⚡ Borne EV
        </button>

        <div style={{ width: "1px", height: "28px", background: "#e5e7eb", flexShrink: 0 }} />

        {/* Tri */}
        <PillGroup
          label="Trier"
          options={[
            { label: "Défaut", value: "default" },
            { label: "Prix ↑", value: "price_asc" },
            { label: "Note ↓", value: "rating_desc" },
            { label: "Détour ↑", value: "detour_asc" },
          ]}
          active={filters.sortBy}
          onChange={(v) => onChange({ ...filters, sortBy: v as Filters["sortBy"] })}
        />

        {hasActive && (
          <>
            <div style={{ width: "1px", height: "28px", background: "#e5e7eb", flexShrink: 0 }} />
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              style={{
                padding: "5px 12px", borderRadius: "20px", flexShrink: 0,
                border: "1.5px solid #FF6240", background: "rgba(255,98,64,0.06)",
                color: "#FF6240", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Réinitialiser
            </button>
          </>
        )}
      </div>

      {hasActive && filteredCount < totalCount && (
        <p style={{ fontSize: "11px", color: "#6B7280", marginTop: "6px" }}>
          {filteredCount} résultat{filteredCount > 1 ? "s" : ""} sur {totalCount}
        </p>
      )}
    </div>
  );
}
