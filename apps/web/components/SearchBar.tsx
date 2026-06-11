"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface Place {
  name: string;
  subtitle?: string;
  lat: number;
  lng: number;
  type?: string;
}

const geocodeCache = new Map<string, Place[]>();

interface DropdownState {
  suggestions: Place[];
  activeIdx: number;
  query: string;
  onSelect: (p: Place) => void;
  onSetActiveIdx: (i: number) => void;
}

interface SearchBarProps {
  onSearch: (origin: Place, destination: Place) => void;
  loading: boolean;
  compact?: boolean;
}

// ── Highlight matching portion of text ────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong style={{ color: "#1E1E2E", fontWeight: 700 }}>{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Location icon ──────────────────────────────────────────────────────────────
function LocationIcon({ type }: { type?: string }) {
  const isMunicipality = !type || type === "Ville" || type === "Lieu";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0, marginRight: "12px", opacity: 0.45 }}>
      {isMunicipality ? (
        // Bâtiment ville
        <>
          <rect x="3" y="10" width="18" height="11" rx="1" fill="#6B7280"/>
          <polygon points="2,10 12,3 22,10" fill="#6B7280"/>
          <rect x="9" y="15" width="6" height="6" fill="white"/>
        </>
      ) : (
        // Cercle région/département
        <circle cx="12" cy="12" r="8" stroke="#6B7280" strokeWidth="2" fill="none"/>
      )}
    </svg>
  );
}

// ── Dropdown ───────────────────────────────────────────────────────────────────
function PillDropdown({ dropdown, compact }: { dropdown: DropdownState; compact: boolean }) {
  const pad = compact ? "10px 18px" : "13px 28px";
  return (
    <div style={{
      position: "absolute",
      top: "calc(100% + 8px)",
      left: 0, right: 0,
      background: "#FFFFFF",
      borderRadius: compact ? "18px" : "24px",
      border: "1px solid rgba(0,0,0,0.08)",
      boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.12)",
      zIndex: 500,
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .suggestion-row { transition: background 0.1s; }
        .suggestion-row:hover { background: rgba(232,100,74,0.05) !important; }
      `}</style>
      <div style={{ animation: "dropIn 0.14s ease" }}>
        {dropdown.suggestions.map((s, i) => {
          const isActive = i === dropdown.activeIdx;
          return (
            <button
              key={i}
              className="suggestion-row"
              onMouseDown={(e) => { e.preventDefault(); dropdown.onSelect(s); }}
              onMouseEnter={() => dropdown.onSetActiveIdx(i)}
              style={{
                display: "flex", alignItems: "center",
                width: "100%", padding: pad,
                textAlign: "left", border: "none",
                background: isActive ? "rgba(232,100,74,0.07)" : "transparent",
                cursor: "pointer",
                borderBottom: i < dropdown.suggestions.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
              }}
            >
              <LocationIcon type={s.type} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: compact ? "14px" : "15px",
                  fontWeight: 500,
                  color: "#374151",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  fontFamily: "var(--font-inter,'Inter'),sans-serif",
                }}>
                  <Highlight text={s.name} query={dropdown.query} />
                </div>
                {s.subtitle && (
                  <div style={{
                    fontSize: "12px", color: "#9CA3AF", marginTop: "1px",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {s.subtitle}
                  </div>
                )}
              </div>
              {s.type && (
                <span style={{
                  fontSize: "10px", fontWeight: 600, color: "#9CA3AF",
                  background: "#F3F4F6", borderRadius: "6px",
                  padding: "2px 7px", marginLeft: "10px", flexShrink: 0,
                  letterSpacing: "0.3px", textTransform: "uppercase",
                }}>
                  {s.type}
                </span>
              )}
            </button>
          );
        })}
        {/* Attribution */}
        <div style={{
          padding: "6px 18px", display: "flex", alignItems: "center", justifyContent: "flex-end",
          borderTop: "1px solid rgba(0,0,0,0.04)",
        }}>
          <span style={{ fontSize: "10px", color: "#D1D5DB", letterSpacing: "0.2px" }}>Powered by MapTiler</span>
        </div>
      </div>
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ width: "1px", height: "28px", background: "#E5E7EB", flexShrink: 0, alignSelf: "center" }} />;
}

// ── AddressInput ───────────────────────────────────────────────────────────────
function AddressInput({
  label, placeholder, icon, value, onSelect, compact, onDropdownChange,
}: {
  label: string; placeholder: string; icon: React.ReactNode;
  value: Place | null; onSelect: (place: Place) => void;
  compact?: boolean; onDropdownChange?: (state: DropdownState | null) => void;
}) {
  const [query, setQuery]           = useState("");
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [open, setOpen]             = useState(false);
  const [focused, setFocused]       = useState(false);
  const [loading, setLoading]       = useState(false);
  // Pre-select first result (Google Maps style)
  const [activeIdx, setActiveIdx]   = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) setQuery(value.name.split(",")[0]);
  }, [value]);

  const handleSelect = useCallback((place: Place) => {
    setQuery(place.name);
    setSuggestions([]); setOpen(false); setActiveIdx(0);
    onDropdownChange?.(null);
    onSelect(place);
  }, [onSelect, onDropdownChange]);

  // Notify parent of dropdown state changes
  useEffect(() => {
    if (!onDropdownChange) return;
    if (open && suggestions.length > 0) {
      onDropdownChange({ suggestions, activeIdx, query, onSelect: handleSelect, onSetActiveIdx: setActiveIdx });
    } else {
      onDropdownChange(null);
    }
  }, [open, suggestions, activeIdx, query, handleSelect, onDropdownChange]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    setActiveIdx(0); // reset to first on each keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 2) {
      setSuggestions([]); setOpen(false); setLoading(false); return;
    }

    // Instant cache hit
    if (geocodeCache.has(q)) {
      const cached = geocodeCache.get(q)!;
      setSuggestions(cached); setOpen(cached.length > 0); setLoading(false);
      return;
    }

    setLoading(true);
    // 180ms debounce — fluide sans être agressif
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        const data: Place[] = await res.json();
        geocodeCache.set(q, data);
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }, 180);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open && suggestions.length > 0) { setOpen(true); return; }
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if ((e.key === "Enter" || e.key === "Tab") && open && suggestions.length > 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false); setActiveIdx(0);
    }
  }

  const vPad = compact ? "10px 18px" : "20px 32px";

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        flex: 1, minWidth: 0,
        padding: vPad,
        paddingRight: compact ? "18px" : "44px",
        cursor: "text",
        background: focused ? "rgba(232,100,74,0.03)" : "transparent",
        transition: "background 0.15s",
        position: "relative",
        borderRadius: "50px",
      }}
    >
      <div style={{
        fontSize: "10px", fontWeight: 700, color: "#9CA3AF",
        marginBottom: "3px", letterSpacing: "0.6px", textTransform: "uppercase",
        display: "flex", alignItems: "center", gap: "5px",
      }}>
        <span>{icon}</span>
        {label}
        {/* Spinner discret pendant le chargement */}
        {loading && (
          <svg width="10" height="10" viewBox="0 0 24 24" style={{ animation: "spin 0.8s linear infinite", marginLeft: "2px", opacity: 0.4 }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle cx="12" cy="12" r="9" stroke="#9CA3AF" strokeWidth="3" fill="none" strokeDasharray="28" strokeDashoffset="10"/>
          </svg>
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setFocused(true);
          if (suggestions.length > 0) setOpen(true);
        }}
        onBlur={() => {
          setFocused(false);
          // Petit délai pour laisser onMouseDown du dropdown se déclencher avant fermeture
          setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        style={{
          width: "100%",
          border: "none", outline: "none",
          fontSize: compact ? "14px" : "18px",
          fontWeight: 500,
          color: query ? "#1E1E2E" : "#9CA3AF",
          background: "transparent",
          fontFamily: "var(--font-inter,'Inter'),sans-serif",
          lineHeight: 1.3,
        }}
      />
      {/* Bouton clear */}
      {focused && query && (
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setQuery(""); setSuggestions([]); setOpen(false);
            onDropdownChange?.(null);
            inputRef.current?.focus();
          }}
          style={{
            position: "absolute", top: "50%", right: compact ? "10px" : "14px",
            transform: "translateY(-50%)",
            width: "20px", height: "20px", borderRadius: "50%",
            background: "#E5E7EB", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", color: "#6B7280", lineHeight: 1,
          }}
        >×</button>
      )}
    </div>
  );
}

// ── SearchBar ─────────────────────────────────────────────────────────────────
export default function SearchBar({ onSearch, loading, compact = false }: SearchBarProps) {
  const [origin,      setOrigin]      = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const [dropdown,    setDropdown]    = useState<DropdownState | null>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const canSearch = !!origin && !!destination && !loading;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const pillStyle: React.CSSProperties = {
    display: "flex", alignItems: "center",
    background: "#FFFFFF",
    border: "1.5px solid #E5E7EB",
    borderRadius: "50px",
    boxShadow: compact
      ? "0 2px 10px rgba(0,0,0,0.07)"
      : "0 4px 6px rgba(0,0,0,0.03), 0 10px 32px rgba(0,0,0,0.09)",
    overflow: "visible",
    position: "relative",
    transition: "box-shadow 0.2s",
  };

  const btnStyle: React.CSSProperties = {
    flexShrink: 0,
    margin: compact ? "5px" : "8px 10px 8px 8px",
    padding: compact ? "9px 18px" : "16px 36px",
    borderRadius: "50px",
    border: "none",
    background: canSearch ? "#E8644A" : "#F3F4F6",
    color: canSearch ? "#FFFFFF" : "#9CA3AF",
    fontSize: compact ? "13px" : "15px",
    fontWeight: 700,
    cursor: canSearch ? "pointer" : "not-allowed",
    fontFamily: "var(--font-nunito,'Nunito'),sans-serif",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
    letterSpacing: "0.2px",
  };

  const common = { compact, onDropdownChange: setDropdown };

  const departIcon = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#E8644A">
      <circle cx="12" cy="9" r="4"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" opacity=".3"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  );

  const arriveeIcon = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#6B7280">
      <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>
    </svg>
  );

  if (compact) {
    return (
      <div ref={pillRef} style={pillStyle}>
        <AddressInput label="Départ"  placeholder="Ville de départ" icon={departIcon}  value={origin}      onSelect={setOrigin}      {...common} />
        <Divider />
        <AddressInput label="Arrivée" placeholder="Ville d'arrivée"    icon={arriveeIcon} value={destination} onSelect={setDestination} {...common} />
        <button onClick={() => canSearch && onSearch(origin!, destination!)} disabled={!canSearch} style={btnStyle}>
          {loading ? "…" : "Chercher →"}
        </button>
        {dropdown && <PillDropdown dropdown={dropdown} compact />}
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div ref={pillRef} style={pillStyle}>
        <AddressInput label="Départ"  placeholder="Ville de départ" icon={departIcon}  value={origin}      onSelect={setOrigin}      {...common} />
        <Divider />
        <AddressInput label="Arrivée" placeholder="Ville d'arrivée"    icon={arriveeIcon} value={destination} onSelect={setDestination} {...common} />
        <button
          onClick={() => canSearch && onSearch(origin!, destination!)}
          disabled={!canSearch}
          style={btnStyle}
          onMouseEnter={(e) => { if (canSearch) (e.currentTarget as HTMLElement).style.background = "#D4563C"; }}
          onMouseLeave={(e) => { if (canSearch) (e.currentTarget as HTMLElement).style.background = "#E8644A"; }}
        >
          {loading ? "Recherche…" : "Voir les hôtels →"}
        </button>
        {dropdown && <PillDropdown dropdown={dropdown} compact={false} />}
      </div>
    </div>
  );
}
