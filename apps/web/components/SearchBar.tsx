"use client";

import { useState, useEffect, useRef } from "react";

interface Place { name: string; lat: number; lng: number; }

// Cache module-level : survit aux re-renders, vide à chaque reload page
const geocodeCache = new Map<string, Place[]>();

interface SearchBarProps {
  onSearch: (origin: Place, destination: Place) => void;
  loading: boolean;
  compact?: boolean;
}

function AddressInput({
  label,
  placeholder,
  icon,
  value,
  onSelect,
  compact,
  isLast,
}: {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  value: Place | null;
  onSelect: (place: Place) => void;
  compact?: boolean;
  isLast?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) setQuery(value.name.split(",")[0]);
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    setActiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 1) { setSuggestions([]); setOpen(false); return; }

    // Résultat en cache → instantané
    if (geocodeCache.has(q)) {
      const cached = geocodeCache.get(q)!;
      setSuggestions(cached);
      setOpen(cached.length > 0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        geocodeCache.set(q, data);
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch { /* ignore */ }
    }, 100);
  }

  function handleSelect(place: Place) {
    setQuery(place.name.split(",")[0]);
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
    onSelect(place);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); handleSelect(suggestions[activeIdx]); }
    else if (e.key === "Escape") { setOpen(false); setActiveIdx(-1); }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) { setOpen(false); setActiveIdx(-1); }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const vPad = compact ? "12px 20px" : "18px 28px";

  return (
    <div
      ref={containerRef}
      onClick={() => inputRef.current?.focus()}
      style={{
        flex: 1, minWidth: 0,
        padding: vPad,
        paddingRight: compact ? "20px" : "36px", // espace pour le ×
        cursor: "text",
        borderRadius: isLast ? "0 50px 50px 0" : "0",
        background: focused ? "rgba(255,98,64,0.04)" : "transparent",
        transition: "background 0.15s",
        position: "relative",
      }}
    >
      <div style={{
        fontSize: "10px", fontWeight: 700, color: "#9ca3af",
        marginBottom: "4px", letterSpacing: "0.6px", textTransform: "uppercase",
        display: "flex", alignItems: "center", gap: "5px",
      }}>
        <span style={{ opacity: 0.8 }}>{icon}</span>
        {label}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => { setFocused(true); suggestions.length > 0 && setOpen(true); }}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: "100%",
          border: "none", outline: "none",
          fontSize: compact ? "14px" : "17px",
          fontWeight: 500,
          color: query ? "#1E1E2E" : "#9ca3af",
          background: "transparent",
          fontFamily: "var(--font-inter), sans-serif",
          lineHeight: 1.3,
        }}
      />
      {/* × absolu, visible uniquement au focus */}
      {focused && query && (
        <button
          onMouseDown={(e) => { e.preventDefault(); setQuery(""); setSuggestions([]); setOpen(false); inputRef.current?.focus(); }}
          style={{
            position: "absolute", top: "50%", right: compact ? "10px" : "14px",
            transform: "translateY(-50%)",
            width: "22px", height: "22px", borderRadius: "50%",
            background: "#e5e7eb", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", color: "#6B7280", lineHeight: 1,
          }}
        >×</button>
      )}

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: isLast ? undefined : 0,
          right: isLast ? 0 : undefined,
          width: "min(620px, 90vw)",
          background: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          zIndex: 500,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.06)",
          animation: "dropIn 0.15s ease",
        }}>
          <style>{`
            @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={() => setActiveIdx(i)}
              style={{
                display: "flex", alignItems: "center",
                width: "100%", padding: "12px 18px",
                textAlign: "left", border: "none",
                background: i === activeIdx ? "#FFF5F3" : "transparent",
                cursor: "pointer",
                borderBottom: i < suggestions.length - 1 ? "1px solid #f9f9f9" : "none",
                transition: "background 0.1s",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#1E1E2E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.name.split(",")[0]}
                </div>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.name.split(",").slice(1, 3).join(",")}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Divider() {
  return (
    <div style={{
      width: "1px", height: "28px", background: "#e5e7eb",
      flexShrink: 0, alignSelf: "center",
    }} />
  );
}

export default function SearchBar({ onSearch, loading, compact = false }: SearchBarProps) {
  const [origin, setOrigin] = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const canSearch = !!origin && !!destination && !loading;

  const pillStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    background: "#FFFFFF",
    border: "1.5px solid #e5e7eb",
    borderRadius: "50px",
    boxShadow: compact
      ? "0 2px 10px rgba(0,0,0,0.07)"
      : "0 4px 24px rgba(0,0,0,0.1)",
    overflow: "visible",
    position: "relative",
    transition: "box-shadow 0.2s",
  };

  const btnStyle: React.CSSProperties = {
    flexShrink: 0,
    margin: compact ? "5px" : "8px 12px 8px 8px",
    padding: compact ? "9px 18px" : "16px 32px",
    borderRadius: "50px",
    border: "none",
    background: canSearch ? "#E8644A" : "#e5e7eb",
    color: canSearch ? "#FFFFFF" : "#9ca3af",
    fontSize: compact ? "13px" : "14px",
    fontWeight: 700,
    cursor: canSearch ? "pointer" : "not-allowed",
    fontFamily: "var(--font-nunito), sans-serif",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
    letterSpacing: "0.2px",
  };

  if (compact) {
    return (
      <div style={pillStyle}>
        <AddressInput
          label="Départ"
          placeholder="D'où partez-vous ?"
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="#E8644A"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>}
          value={origin}
          onSelect={setOrigin}
          compact
        />
        <Divider />
        <AddressInput
          label="Arrivée"
          placeholder="Où allez-vous ?"
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="#6B7280"><path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/></svg>}
          value={destination}
          onSelect={setDestination}
          compact
          isLast
        />
        <button
          onClick={() => canSearch && onSearch(origin!, destination!)}
          disabled={!canSearch}
          style={btnStyle}
        >
          {loading ? "..." : "Chercher →"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={pillStyle}>
        <AddressInput
          label="Départ"
          placeholder="D'où partez-vous ?"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="#E8644A"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>}
          value={origin}
          onSelect={setOrigin}
        />
        <Divider />
        <AddressInput
          label="Arrivée"
          placeholder="Où allez-vous ?"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="#6B7280"><path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/></svg>}
          value={destination}
          onSelect={setDestination}
          isLast
        />
        <button
          onClick={() => canSearch && onSearch(origin!, destination!)}
          disabled={!canSearch}
          style={btnStyle}
        >
          {loading ? "Recherche..." : "Voir les hôtels →"}
        </button>
      </div>
    </div>
  );
}
