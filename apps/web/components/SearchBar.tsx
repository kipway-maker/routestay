"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Place { name: string; lat: number; lng: number; }

const geocodeCache = new Map<string, Place[]>();

interface DropdownState {
  suggestions: Place[];
  activeIdx: number;
  onSelect: (p: Place) => void;
  onSetActiveIdx: (i: number) => void;
}

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
  onDropdownChange,
}: {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  value: Place | null;
  onSelect: (place: Place) => void;
  compact?: boolean;
  onDropdownChange?: (state: DropdownState | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) setQuery(value.name.split(",")[0]);
  }, [value]);

  const handleSelect = useCallback((place: Place) => {
    setQuery(place.name.split(",")[0]);
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
    onDropdownChange?.(null);
    onSelect(place);
  }, [onSelect, onDropdownChange]);

  // Notify parent of dropdown state changes
  useEffect(() => {
    if (!onDropdownChange) return;
    if (open && suggestions.length > 0) {
      onDropdownChange({ suggestions, activeIdx, onSelect: handleSelect, onSetActiveIdx: setActiveIdx });
    } else {
      onDropdownChange(null);
    }
  }, [open, suggestions, activeIdx, handleSelect, onDropdownChange]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    setActiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 1) { setSuggestions([]); setOpen(false); return; }

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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); handleSelect(suggestions[activeIdx]); }
    else if (e.key === "Escape") { setOpen(false); setActiveIdx(-1); }
  }

  const vPad = compact ? "12px 20px" : "22px 36px";

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        flex: 1, minWidth: 0,
        padding: vPad,
        paddingRight: compact ? "20px" : "48px",
        cursor: "text",
        background: focused ? "rgba(232,100,74,0.04)" : "transparent",
        transition: "background 0.15s",
        position: "relative",
        borderRadius: "50px",
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
        onFocus={() => { setFocused(true); if (suggestions.length > 0) setOpen(true); }}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: "100%",
          border: "none", outline: "none",
          fontSize: compact ? "14px" : "19px",
          fontWeight: 500,
          color: query ? "#1E1E2E" : "#9ca3af",
          background: "transparent",
          fontFamily: "var(--font-inter, 'Inter'), sans-serif",
          lineHeight: 1.3,
        }}
      />
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
            width: "22px", height: "22px", borderRadius: "50%",
            background: "#e5e7eb", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", color: "#6B7280", lineHeight: 1,
          }}
        >×</button>
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

// Dropdown rendered at pill level — full width, DA matching the pill
function PillDropdown({ dropdown, compact }: { dropdown: DropdownState; compact: boolean }) {
  return (
    <div style={{
      position: "absolute",
      top: "calc(100% + 10px)",
      left: 0,
      right: 0,
      background: "#FFFFFF",
      borderRadius: compact ? "20px" : "28px",
      border: "1.5px solid #e5e7eb",
      boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
      zIndex: 500,
      overflow: "hidden",
      animation: "dropIn 0.15s ease",
    }}>
      <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
      {dropdown.suggestions.map((s, i) => (
        <button
          key={i}
          onMouseDown={() => dropdown.onSelect(s)}
          onMouseEnter={() => dropdown.onSetActiveIdx(i)}
          style={{
            display: "flex", alignItems: "center",
            width: "100%",
            padding: compact ? "10px 20px" : "14px 36px",
            textAlign: "left", border: "none",
            background: i === dropdown.activeIdx ? "rgba(232,100,74,0.06)" : "transparent",
            cursor: "pointer",
            borderBottom: i < dropdown.suggestions.length - 1 ? "1px solid #f3f4f6" : "none",
            transition: "background 0.1s",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: compact ? "14px" : "16px", fontWeight: 600, color: "#1E1E2E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {s.name.split(",")[0]}
            </div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {s.name.split(",").slice(1, 3).join(",")}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function SearchBar({ onSearch, loading, compact = false }: SearchBarProps) {
  const [origin, setOrigin] = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const [dropdown, setDropdown] = useState<DropdownState | null>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const canSearch = !!origin && !!destination && !loading;

  // Close dropdown on outside click
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
    display: "flex",
    alignItems: "center",
    background: "#FFFFFF",
    border: "1.5px solid #e5e7eb",
    borderRadius: "50px",
    boxShadow: compact ? "0 2px 10px rgba(0,0,0,0.07)" : "0 4px 24px rgba(0,0,0,0.1)",
    overflow: "visible",
    position: "relative",
    transition: "box-shadow 0.2s",
  };

  const btnStyle: React.CSSProperties = {
    flexShrink: 0,
    margin: compact ? "5px" : "10px 14px 10px 10px",
    padding: compact ? "9px 18px" : "18px 40px",
    borderRadius: "50px",
    border: "none",
    background: canSearch ? "#E8644A" : "#e5e7eb",
    color: canSearch ? "#FFFFFF" : "#9ca3af",
    fontSize: compact ? "13px" : "16px",
    fontWeight: 700,
    cursor: canSearch ? "pointer" : "not-allowed",
    fontFamily: "var(--font-nunito, 'Nunito'), sans-serif",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
    letterSpacing: "0.2px",
  };

  const commonInputProps = { compact, onDropdownChange: setDropdown };

  if (compact) {
    return (
      <div ref={pillRef} style={pillStyle}>
        <AddressInput label="Départ" placeholder="D'où partez-vous ?" value={origin} onSelect={setOrigin}
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="#E8644A"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>}
          {...commonInputProps} />
        <Divider />
        <AddressInput label="Arrivée" placeholder="Où allez-vous ?" value={destination} onSelect={setDestination}
          icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="#6B7280"><path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/></svg>}
          {...commonInputProps} />
        <button onClick={() => canSearch && onSearch(origin!, destination!)} disabled={!canSearch} style={btnStyle}>
          {loading ? "..." : "Chercher →"}
        </button>
        {dropdown && <PillDropdown dropdown={dropdown} compact />}
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div ref={pillRef} style={pillStyle}>
        <AddressInput label="Départ" placeholder="D'où partez-vous ?" value={origin} onSelect={setOrigin}
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="#E8644A"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>}
          {...commonInputProps} />
        <Divider />
        <AddressInput label="Arrivée" placeholder="Où allez-vous ?" value={destination} onSelect={setDestination}
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="#6B7280"><path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/></svg>}
          {...commonInputProps} />
        <button onClick={() => canSearch && onSearch(origin!, destination!)} disabled={!canSearch} style={btnStyle}>
          {loading ? "Recherche..." : "Voir les hôtels →"}
        </button>
        {dropdown && <PillDropdown dropdown={dropdown} compact={false} />}
      </div>
    </div>
  );
}
