"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const COOKIE_NAME = "kw_tutorial_done_v1";
const PAD = 14;
const BUBBLE_W = 300;

const STEPS = [
  {
    selector: '[data-tutorial="timeline"]',
    emoji: "👆",
    title: "Placez votre étape sur la ligne",
    body: "Glissez le curseur ou cliquez sur la ligne du temps pour choisir l'heure de votre pause.",
    side: "bottom" as const,
  },
  {
    selector: '[data-tutorial="map"]',
    emoji: "🗺️",
    title: "Ou cliquez sur la carte",
    body: "Cliquez n'importe où sur le trajet rouge — le pin se déplace et la recherche se relance.",
    side: "left" as const,
  },
  {
    selector: '[data-tutorial="hotels"]',
    emoji: "🏨",
    title: "Les hôtels apparaissent ici",
    body: "Une fois votre étape posée, les meilleurs hôtels à proximité s'affichent dans cette liste.",
    side: "right" as const,
  },
];

interface Rect { x: number; y: number; w: number; h: number; }

function hasCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(COOKIE_NAME + "="));
}
function setCookie() {
  const d = new Date(); d.setFullYear(d.getFullYear() + 1);
  document.cookie = `${COOKIE_NAME}=1; expires=${d.toUTCString()}; path=/`;
}

function measure(idx: number): Rect | null {
  const el = document.querySelector(STEPS[idx].selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

export default function SpotlightTutorial({ ready }: { ready: boolean }) {
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [entering, setEntering] = useState(false);
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    if (!ready || hasCookie()) return;
    const t = setTimeout(() => {
      const r = measure(0);
      setRect(r);
      setStep(0);
    }, 700);
    return () => clearTimeout(t);
  }, [ready]);

  const dismiss = useCallback(() => {
    setCookie();
    setStep(null);
    setRect(null);
  }, []);

  // Navigation : mesure directement le prochain élément → transition CSS fluide sans reset
  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= STEPS.length) { dismiss(); return; }
    const r = measure(idx);
    setEntering(true);
    setStep(idx);
    setRect(r);
    setTimeout(() => setEntering(false), 10);
  }, [dismiss]);

  const next = useCallback(() => {
    if (stepRef.current === null) return;
    if (stepRef.current >= STEPS.length - 1) { dismiss(); return; }
    goTo(stepRef.current + 1);
  }, [goTo, dismiss]);

  const prev = useCallback(() => {
    if (stepRef.current === null || stepRef.current === 0) return;
    goTo(stepRef.current - 1);
  }, [goTo]);

  if (step === null) return null;

  const s = STEPS[step];

  // Coords spotlight
  const spotX = rect ? rect.x - PAD : -9999;
  const spotY = rect ? rect.y - PAD : -9999;
  const spotW = rect ? rect.w + PAD * 2 : 0;
  const spotH = rect ? rect.h + PAD * 2 : 0;

  // Position bulle
  const GAP = 16;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  let bLeft = 0, bTop = 0;
  if (rect) {
    if (s.side === "bottom") {
      bLeft = Math.max(16, Math.min(vw - BUBBLE_W - 16, spotX + spotW / 2 - BUBBLE_W / 2));
      bTop = spotY + spotH + GAP;
    } else if (s.side === "top") {
      bLeft = Math.max(16, Math.min(vw - BUBBLE_W - 16, spotX + spotW / 2 - BUBBLE_W / 2));
      bTop = spotY - GAP - 200;
    } else if (s.side === "left") {
      const bl = spotX - BUBBLE_W - GAP;
      bLeft = bl < 16 ? spotX + spotW + GAP : bl;
      bTop = Math.max(16, Math.min(vh - 240, spotY + spotH / 2 - 100));
    } else {
      bLeft = Math.min(vw - BUBBLE_W - 16, spotX + spotW + GAP);
      bTop = Math.max(16, Math.min(vh - 240, spotY + spotH / 2 - 100));
    }
  }

  return (
    <>
      <style>{`
        @keyframes kw-tut-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes kw-spot-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,100,74,0.4); }
          50%       { box-shadow: 0 0 0 6px rgba(232,100,74,0); }
        }
      `}</style>

      {/* Backdrop cliquable */}
      <div onClick={dismiss} style={{ position: "fixed", inset: 0, zIndex: 9997, cursor: "pointer" }} />

      {/* Overlay sombre — box-shadow autour du spotlight */}
      <div style={{
        position: "fixed",
        left: spotX, top: spotY,
        width: spotW, height: spotH,
        borderRadius: 16,
        zIndex: 9999,
        pointerEvents: "none",
        boxShadow: rect ? `0 0 0 9999px rgba(0,0,0,0.68)` : `0 0 0 9999px rgba(0,0,0,0)`,
        transition: [
          "left 0.45s cubic-bezier(.4,0,.2,1)",
          "top 0.45s cubic-bezier(.4,0,.2,1)",
          "width 0.45s cubic-bezier(.4,0,.2,1)",
          "height 0.45s cubic-bezier(.4,0,.2,1)",
          "box-shadow 0.3s ease",
        ].join(", "),
      }} />

      {/* Bague orange pulsante */}
      <div style={{
        position: "fixed",
        left: spotX - 2, top: spotY - 2,
        width: spotW + 4, height: spotH + 4,
        borderRadius: 18,
        border: "2px solid rgba(232,100,74,0.85)",
        zIndex: 10000,
        pointerEvents: "none",
        opacity: rect ? 1 : 0,
        animation: rect ? "kw-spot-ring 2s ease-in-out infinite" : undefined,
        transition: [
          "left 0.45s cubic-bezier(.4,0,.2,1)",
          "top 0.45s cubic-bezier(.4,0,.2,1)",
          "width 0.45s cubic-bezier(.4,0,.2,1)",
          "height 0.45s cubic-bezier(.4,0,.2,1)",
          "opacity 0.3s",
        ].join(", "),
      }} />

      {/* Bulle */}
      <div
        key={step}
        style={{
          position: "fixed",
          left: bLeft, top: bTop,
          width: BUBBLE_W,
          zIndex: 10001,
          background: "#fff",
          borderRadius: 20,
          padding: "22px 22px 18px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.20), 0 2px 8px rgba(0,0,0,0.08)",
          animation: "kw-tut-in 0.28s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fermer */}
        <button
          onClick={dismiss}
          style={{
            position: "absolute", top: 12, right: 14,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 16, color: "#D1D5DB", lineHeight: 1,
            width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%",
          }}
        >✕</button>

        {/* Emoji + titre */}
        <div style={{ fontSize: 22, marginBottom: 8 }}>{s.emoji}</div>
        <div style={{
          fontSize: 15, fontWeight: 800, color: "#1E1E2E", marginBottom: 6,
          fontFamily: "var(--font-nunito, sans-serif)", lineHeight: 1.3, paddingRight: 20,
        }}>{s.title}</div>
        <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.55, marginBottom: 20 }}>{s.body}</div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Dots */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 20 : 6, height: 6, borderRadius: 3,
                background: i === step ? "#E8644A" : "#E5E7EB",
                transition: "width 0.25s, background 0.25s",
              }} />
            ))}
          </div>

          {/* Boutons nav */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {step > 0 && (
              <button
                onClick={prev}
                style={{
                  fontSize: 12, fontWeight: 600, color: "#9CA3AF",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "8px 10px", borderRadius: 8,
                }}
              >← Préc.</button>
            )}
            <button
              onClick={next}
              style={{
                fontSize: 13, fontWeight: 700, color: "#fff",
                background: "linear-gradient(135deg, #E8644A, #F09070)",
                border: "none", borderRadius: 12,
                cursor: "pointer", padding: "9px 20px",
                fontFamily: "var(--font-nunito, sans-serif)",
                boxShadow: "0 4px 12px rgba(232,100,74,0.35)",
                whiteSpace: "nowrap",
              }}
            >
              {step >= STEPS.length - 1 ? "C'est parti !" : "Suivant →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
