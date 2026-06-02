"use client";

import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";

interface Place { name: string; lat: number; lng: number; }

// ── Orbe décoratif (blob coloré flou) ────────────────────────
function Orb({ x, y, size, color, opacity = 0.55 }: { x: string; y: string; size: number; color: string; opacity?: number }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      width: size, height: size,
      borderRadius: "50%",
      background: color,
      opacity,
      filter: `blur(${size * 0.45}px)`,
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
    }} />
  );
}

// ── Carte glass ───────────────────────────────────────────────
function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.45)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.65)",
      borderRadius: "24px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Badge feature ─────────────────────────────────────────────
function FeatureBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "8px",
      background: "rgba(255,255,255,0.55)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.7)",
      borderRadius: "50px",
      padding: "8px 16px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    }}>
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <span style={{ fontSize: "13px", fontWeight: 600, color: "#3A3A5C" }}>{label}</span>
    </div>
  );
}

export default function IndexGlass() {
  const router = useRouter();

  function handleSearch(origin: Place, destination: Place) {
    const params = new URLSearchParams({
      fromName: origin.name, fromLat: String(origin.lat), fromLng: String(origin.lng),
      toName: destination.name, toLat: String(destination.lat), toLng: String(destination.lng),
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div style={{
      minHeight: "100vh",
      overflowY: "auto", overflowX: "hidden",
      background: "linear-gradient(135deg, #FFE8D6 0%, #FFF4EE 20%, #EEF4FF 45%, #F4EEFF 70%, #FFE8F2 100%)",
      fontFamily: "var(--font-inter,'Inter'),sans-serif",
      position: "relative",
    }}>

      {/* ── ORBES DE FOND ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <Orb x="10%"  y="12%"  size={420} color="#FFB5A0" opacity={0.35} />
        <Orb x="82%"  y="8%"   size={380} color="#A8C8FF" opacity={0.30} />
        <Orb x="55%"  y="38%"  size={320} color="#D4B8FF" opacity={0.25} />
        <Orb x="15%"  y="55%"  size={350} color="#FFD6A0" opacity={0.28} />
        <Orb x="88%"  y="60%"  size={300} color="#A8E8D0" opacity={0.25} />
        <Orb x="40%"  y="80%"  size={400} color="#FFB0C8" opacity={0.22} />
        <Orb x="70%"  y="90%"  size={280} color="#FFE0A0" opacity={0.28} />
      </div>

      {/* ── HEADER GLASS ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, padding: "0 clamp(20px,5vw,72px)" }}>
        <div style={{
          margin: "12px 0 0",
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.7)",
          borderRadius: "20px",
          padding: "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-kipway-v2.png" alt="KipWay" style={{ height: "44px", width: "auto", mixBlendMode: "multiply" }} />
          <a
            href="mailto:contact@kipway.fr"
            style={{
              fontSize: "13px", fontWeight: 700, color: "#E8644A",
              background: "rgba(232,100,74,0.10)",
              border: "1px solid rgba(232,100,74,0.25)",
              padding: "8px 18px", borderRadius: "50px",
              textDecoration: "none",
            }}
          >
            Nous contacter
          </a>
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "clamp(48px,8vw,100px) clamp(20px,5vw,72px) clamp(40px,6vw,80px)",
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center",
      }}>

        {/* Pill label */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(232,100,74,0.12)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(232,100,74,0.25)",
          borderRadius: "50px", padding: "6px 16px",
          fontSize: "12px", fontWeight: 700, color: "#E8644A",
          letterSpacing: "0.5px", textTransform: "uppercase",
          marginBottom: "24px",
        }}>
          🗺️ Road Trip Planner
        </div>

        {/* Titre */}
        <h1 style={{
          fontFamily: "var(--font-nunito,'Nunito'),sans-serif",
          fontWeight: 900,
          fontSize: "clamp(36px,5vw,72px)",
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
          color: "#1E1E2E",
          marginBottom: "20px",
          maxWidth: "700px",
        }}>
          Tous les hôtels{" "}
          <span style={{
            background: "linear-gradient(135deg, #E8644A, #FF9060)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>sur votre route</span>
        </h1>

        <p style={{
          fontSize: "clamp(15px,1.4vw,18px)",
          color: "rgba(30,30,46,0.55)",
          maxWidth: "480px",
          lineHeight: 1.7,
          marginBottom: "40px",
        }}>
          Entrez départ et arrivée. La route s&apos;affiche, les hôtels avec.
        </p>

        {/* Search card glass */}
        <GlassCard style={{ width: "100%", maxWidth: "820px", padding: "24px", marginBottom: "36px" }}>
          <SearchBar onSearch={handleSearch} loading={false} />
        </GlassCard>

        {/* Feature badges */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          <FeatureBadge icon="⚡" label="Borne EV" />
          <FeatureBadge icon="↗" label="Détour en min" />
          <FeatureBadge icon="🌙" label="Accueil 24h" />
          <FeatureBadge icon="💶" label="Prix par nuit" />
          <FeatureBadge icon="★" label="Note des voyageurs" />
        </div>
      </section>

      {/* ── STATS GLASS ── */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "0 clamp(20px,5vw,72px) clamp(60px,8vw,100px)",
        display: "flex", justifyContent: "center",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          width: "100%", maxWidth: "820px",
        }}>
          {[
            { value: "50 000+", label: "Hôtels indexés", icon: "🏨" },
            { value: "< 2 sec", label: "Calcul d'itinéraire", icon: "⚡" },
            { value: "100%", label: "Gratuit", icon: "🎯" },
          ].map((stat) => (
            <GlassCard key={stat.label} style={{ padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{
                fontFamily: "var(--font-nunito)",
                fontSize: "clamp(22px,3vw,32px)", fontWeight: 900,
                color: "#1E1E2E", lineHeight: 1, marginBottom: "6px",
              }}>{stat.value}</div>
              <div style={{ fontSize: "12px", color: "rgba(30,30,46,0.5)", fontWeight: 600 }}>{stat.label}</div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "0 clamp(20px,5vw,72px) clamp(60px,8vw,100px)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{
            fontFamily: "var(--font-nunito)", fontWeight: 900,
            fontSize: "clamp(26px,3vw,42px)", color: "#1E1E2E",
            letterSpacing: "-0.02em", marginBottom: "10px",
          }}>
            Simple comme bonjour
          </h2>
          <p style={{ fontSize: "15px", color: "rgba(30,30,46,0.5)" }}>Trois étapes, c&apos;est tout.</p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          maxWidth: "820px", margin: "0 auto",
        }}>
          {[
            { step: "01", icon: "📍", title: "Entrez l'itinéraire", desc: "Départ + arrivée. La route se calcule en temps réel.", color: "#E8644A" },
            { step: "02", icon: "🗺️", title: "Explorez les hôtels", desc: "Tous les hébergements sur votre chemin, avec le détour.", color: "#A78BFA" },
            { step: "03", icon: "🚗", title: "Partez !", desc: "Réservez en un clic. La route vous attend.", color: "#06D6A0" },
          ].map((item) => (
            <GlassCard key={item.step} style={{ padding: "28px 24px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "16px",
                background: `${item.color}18`,
                border: `1px solid ${item.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", marginBottom: "16px",
              }}>
                {item.icon}
              </div>
              <div style={{
                fontSize: "10px", fontWeight: 800, color: item.color,
                letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px",
              }}>
                Étape {item.step}
              </div>
              <div style={{
                fontFamily: "var(--font-nunito)", fontWeight: 800,
                fontSize: "16px", color: "#1E1E2E", marginBottom: "8px",
              }}>
                {item.title}
              </div>
              <div style={{ fontSize: "13px", color: "rgba(30,30,46,0.55)", lineHeight: 1.6 }}>
                {item.desc}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "0 clamp(20px,5vw,72px) clamp(60px,8vw,100px)",
        display: "flex", justifyContent: "center",
      }}>
        <GlassCard style={{ width: "100%", maxWidth: "820px", padding: "48px 40px", textAlign: "center" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "20px",
            background: "linear-gradient(135deg, #E8644A, #FF9060)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px", margin: "0 auto 20px",
            boxShadow: "0 8px 24px rgba(232,100,74,0.3)",
          }}>🚗</div>
          <h2 style={{
            fontFamily: "var(--font-nunito)", fontWeight: 900,
            fontSize: "clamp(24px,3vw,38px)", color: "#1E1E2E",
            letterSpacing: "-0.02em", marginBottom: "10px",
          }}>
            Prêt pour votre prochain road trip ?
          </h2>
          <p style={{ fontSize: "15px", color: "rgba(30,30,46,0.5)", marginBottom: "32px" }}>
            Entrez votre itinéraire ci-dessous. C&apos;est tout.
          </p>
          <SearchBar onSearch={handleSearch} loading={false} />
        </GlassCard>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.5)",
        background: "rgba(255,255,255,0.3)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "24px clamp(20px,5vw,72px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon-kipway.png" alt="KipWay" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
          <span style={{ fontSize: "12px", color: "rgba(30,30,46,0.45)" }}>© 2025 KipWay · Tous droits réservés</span>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          {["Mentions légales", "CGU", "Confidentialité"].map(l => (
            <a key={l} href="#" style={{ fontSize: "12px", color: "rgba(30,30,46,0.45)", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
