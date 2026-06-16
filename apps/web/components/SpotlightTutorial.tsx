"use client";

import { useEffect, useState, useCallback } from "react";

const COOKIE_NAME = "kw_tutorial_done_v1";
const PAD = 14;
const BUBBLE_W = 300;

const STEPS = [
  {
    selector: '[data-tutorial="timeline"]',
    emoji: "👆",
    title: "Placez votre étape sur la ligne",
    body: "Glissez le curseur ou cliquez sur la ligne du temps pour choisir l'heure de votre pause. Les hôtels autour se chargent automatiquement.",
    side: "bottom" as "top"|"bottom"|"left"|"right",
  },
  {
    selector: '[data-tutorial="map"]',
    emoji: "🗺️",
    title: "Ou cliquez directement sur la carte",
    body: "Cliquez n'importe où sur le trajet rouge — le pin se déplace et la recherche se relance.",
    side: "left" as "top"|"bottom"|"left"|"right",
  },
  {
    selector: '[data-tutorial="hotels"]',
    emoji: "🏨",
    title: "Les hôtels apparaissent ici",
    body: "Une fois votre étape posée, les meilleurs hôtels à proximité s'affichent dans cette liste, triés par pertinence.",
    side: "right" as "top"|"bottom"|"left"|"right",
  },
];

interface Rect { x: number; y: number; w: number; h: number; }

function hasCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(COOKIE_NAME + "="));
}
function setCookie() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  document.cookie = `${COOKIE_NAME}=1; expires=${d.toUTCString()}; path=/`;
}

export default function SpotlightTutorial({ ready }: { ready: boolean }) {
  const [step, setStep]   = useState<number | null>(null);
  const [rect, setRect]   = useState<Rect | null>(null);
  const [visible, setVisible] = useState(false);

  const measure = useCallback((idx: number): Rect | null => {
    const el = document.querySelector(STEPS[idx].selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }, []);

  // Lancement après que la route soit chargée (ready)
  useEffect(() => {
    if (!ready || hasCookie()) return;
    const t = setTimeout(() => { setStep(0); setVisible(true); }, 600);
    return () => clearTimeout(t);
  }, [ready]);

  // Mesure quand step change
  useEffect(() => {
    if (step === null) return;
    // Légère attente pour que le DOM soit stable
    const t = setTimeout(() => { setRect(measure(step)); }, 50);
    return () => clearTimeout(t);
  }, [step, measure]);

  const dismiss = useCallback(() => {
    setCookie();
    setVisible(false);
    setTimeout(() => setStep(null), 400);
  }, []);

  const next = useCallback(() => {
    if (step === null) return;
    if (step >= STEPS.length - 1) { dismiss(); return; }
    setRect(null); // reset pour transition
    setTimeout(() => setStep(step + 1), 50);
  }, [step, dismiss]);

  const prev = useCallback(() => {
    if (step === null || step === 0) return;
    setRect(null);
    setTimeout(() => setStep(step - 1), 50);
  }, [step]);

  if (step === null) return null;

  const s = STEPS[step];
  const spotX = rect ? rect.x - PAD : -9999;
  const spotY = rect ? rect.y - PAD : -9999;
  const spotW = rect ? rect.w + PAD * 2 : 0;
  const spotH = rect ? rect.h + PAD * 2 : 0;

  // Position bulle
  let bubbleStyle: React.CSSProperties = {
    position: "fixed", width: BUBBLE_W,
    zIndex: 10001, opacity: rect ? 1 : 0,
    transition: "opacity 0.3s ease, left 0.4s cubic-bezier(.4,0,.2,1), top 0.4s cubic-bezier(.4,0,.2,1)",
  };
  if (rect) {
    const GAP = 18;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (s.side === "bottom") {
      bubbleStyle = { ...bubbleStyle,
        left: Math.max(16, Math.min(vw - BUBBLE_W - 16, spotX + spotW / 2 - BUBBLE_W / 2)),
        top: spotY + spotH + GAP,
      };
    } else if (s.side === "top") {
      bubbleStyle = { ...bubbleStyle,
        left: Math.max(16, Math.min(vw - BUBBLE_W - 16, spotX + spotW / 2 - BUBBLE_W / 2)),
        top: spotY - GAP - 180,
      };
    } else if (s.side === "left") {
      const bl = spotX - BUBBLE_W - GAP;
      bubbleStyle = { ...bubbleStyle,
        left: bl < 16 ? spotX + spotW + GAP : bl,
        top: Math.max(16, Math.min(vh - 220, spotY + spotH / 2 - 90)),
      };
    } else {
      bubbleStyle = { ...bubbleStyle,
        left: Math.min(vw - BUBBLE_W - 16, spotX + spotW + GAP),
        top: Math.max(16, Math.min(vh - 220, spotY + spotH / 2 - 90)),
      };
    }
  }

  return (
    <>
      <style>{`
        @keyframes kw-tut-in {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Click-to-dismiss background */}
      <div
        onClick={dismiss}
        style={{ position: "fixed", inset: 0, zIndex: 9997, cursor: "pointer" }}
      />

      {/* Spotlight — box-shadow trick */}
      <div style={{
        position: "fixed",
        left: spotX, top: spotY,
        width: spotW, height: spotH,
        borderRadius: 14,
        boxShadow: `0 0 0 9999px rgba(0,0,0,${visible ? "0.72" : "0"})`,
        zIndex: 9999,
        pointerEvents: "none",
        transition: [
          `left 0.4s cubic-bezier(.4,0,.2,1)`,
          `top 0.4s cubic-bezier(.4,0,.2,1)`,
          `width 0.4s cubic-bezier(.4,0,.2,1)`,
          `height 0.4s cubic-bezier(.4,0,.2,1)`,
          `box-shadow 0.3s ease`,
        ].join(", "),
      }}/>

      {/* Bague de surbrillance */}
      <div style={{
        position: "fixed",
        left: spotX - 2, top: spotY - 2,
        width: spotW + 4, height: spotH + 4,
        borderRadius: 16,
        border: "2px solid rgba(232,100,74,0.8)",
        zIndex: 10000,
        pointerEvents: "none",
        opacity: rect ? 1 : 0,
        transition: "opacity 0.3s, left 0.4s cubic-bezier(.4,0,.2,1), top 0.4s cubic-bezier(.4,0,.2,1), width 0.4s, height 0.4s",
        animation: rect ? "kw-pin-pulse 1.8s ease-in-out infinite" : undefined,
        boxShadow: "0 0 0 4px rgba(232,100,74,0.15)",
      }}/>

      {/* Bulle d'explication */}
      <div style={{
        ...bubbleStyle,
        background: "#fff",
        borderRadius: 18,
        padding: "20px 22px 18px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.10)",
        animation: rect ? "kw-tut-in 0.3s ease" : undefined,
      }}>
        {/* Fermer */}
        <button onClick={(e) => { e.stopPropagation(); dismiss(); }} style={{
          position: "absolute", top: 12, right: 14,
          background: "none", border: "none", cursor: "pointer",
          fontSize: 18, color: "#D1D5DB", lineHeight: 1,
        }}>✕</button>

        <div style={{ fontSize: 24, marginBottom: 8 }}>{s.emoji}</div>
        <div style={{
          fontSize: 15, fontWeight: 800, color: "#1E1E2E", marginBottom: 6,
          fontFamily: "var(--font-nunito, sans-serif)", lineHeight: 1.3,
          paddingRight: 20,
        }}>{s.title}</div>
        <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.55, marginBottom: 18 }}>{s.body}</div>

        {/* Footer nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Dots */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 22 : 6, height: 6, borderRadius: 3,
                background: i === step ? "#E8644A" : "#E5E7EB",
                transition: "width 0.2s, background 0.2s",
              }}/>
            ))}
            <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 6, fontWeight: 600 }}>
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {step > 0 && (
              <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{
                fontSize: 12, fontWeight: 600, color: "#9CA3AF",
                background: "none", border: "none", cursor: "pointer",
                padding: "7px 10px", borderRadius: 8,
              }}>← Préc.</button>
            )}
            <button onClick={(e) => { e.stopPropagation(); next(); }} style={{
              fontSize: 13, fontWeight: 700, color: "#fff",
              background: "linear-gradient(135deg, #E8644A, #F09070)",
              border: "none", borderRadius: 10,
              cursor: "pointer", padding: "9px 20px",
              fontFamily: "var(--font-nunito, sans-serif)",
              boxShadow: "0 4px 12px rgba(232,100,74,0.35)",
            }}>
              {step >= STEPS.length - 1 ? "Commencer ! 🚗" : "Suivant →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
