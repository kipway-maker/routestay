"use client";

import { useState, useEffect, useRef } from "react";

interface Place { name: string; lat: number; lng: number; }

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) setQuery(value.name.split(",")[0]);
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        setSuggestions(await res.json());
        setOpen(true);
      } catch { /* ignore */ }
    }, 400);
  }

  function handleSelect(place: Place) {
    setQuery(place.name.split(",")[0]);
    setSuggestions([]);
    setOpen(false);
    onSelect(place);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const vPad = compact ? "13px 22px" : "16px 26px";

  return (
    <div
      ref={containerRef}
      onClick={() => inputRef.current?.focus()}
      style={{
        flex: 1, minWidth: 0,
        padding: vPad,
        cursor: "text",
        borderRadius: isLast ? "0 50px 50px 0" : "0",
        background: focused ? "rgba(0,0,0,0.03)" : "transparent",
        transition: "background 0.15s",
        position: "relative",
      }}
    >
      <div style={{
        fontSize: "11px", fontWeight: 700, color: "#9ca3af",
        marginBottom: "3px", letterSpacing: "0.4px", textTransform: "uppercase",
        display: "flex", alignItems: "center", gap: "5px",
      }}>
        <span style={{ opacity: 0.7 }}>{icon}</span>
        {label}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => { setFocused(true); suggestions.length > 0 && setOpen(true); }}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: "100%",
          border: "none", outline: "none",
          fontSize: compact ? "14px" : "15px",
          fontWeight: 500,
          color: query ? "#1A1A2E" : "#9ca3af",
          background: "transparent",
          fontFamily: "var(--font-inter), sans-serif",
          lineHeight: 1.4,
        }}
      />

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: "-4px",
          width: "280px",
          background: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
          zIndex: 500,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.06)",
        }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => handleSelect(s)}
              style={{
                display: "flex", alignItems: "flex-start", gap: "10px",
                width: "100%", padding: "11px 14px",
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
    margin: compact ? "5px" : "6px 10px 6px 6px",
    padding: compact ? "9px 18px" : "13px 26px",
    borderRadius: "50px",
    border: "none",
    background: canSearch ? "#FF6240" : "#e5e7eb",
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
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="#FF6240"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>}
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
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="#FF6240"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>}
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
