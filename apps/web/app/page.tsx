"use client";

import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import TutorialRoute from "@/components/home/TutorialRoute";
import PersonalizationSection from "@/components/home/PersonalizationSection";

interface Place { name: string; lat: number; lng: number; }

export default function HomePage() {
  const router = useRouter();

  function handleSearch(origin: Place, destination: Place) {
    const params = new URLSearchParams({
      fromName: origin.name, fromLat: String(origin.lat), fromLng: String(origin.lng),
      toName: destination.name, toLat: String(destination.lat), toLng: String(destination.lng),
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div style={{ height: "100vh", overflowY: "auto", overflowX: "hidden", scrollbarGutter: "stable", background: "#F8F7F4", fontFamily: "var(--font-inter, 'Inter'), sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        isolation: "isolate",
        background: "rgba(248,247,244,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        padding: "0 32px", height: "150px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Gradient top border — replaces border-image (incompatible with border-radius cross-platform) */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #E8644A, #F09070, #6FA8C0)" }} />

        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-kipway-v2.png" alt="KipWay" style={{ height: "136px", width: "auto", mixBlendMode: "multiply" }} />
        </div>
        <a
          href="#search"
          style={{
            padding: "8px 20px", borderRadius: "20px",
            background: "#E8644A", color: "#FFFFFF",
            fontSize: "13px", fontWeight: 700,
            textDecoration: "none",
            fontFamily: "var(--font-nunito, 'Nunito'), sans-serif",
            boxShadow: "0 4px 14px rgba(255,98,64,0.3)",
          }}
        >
          Commencer →
        </a>
      </header>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "calc(100vh - 150px)",
        display: "flex", flexDirection: "column",
        /* Left-align content so the dog appears to the right of the inputs */
        alignItems: "flex-start", justifyContent: "center",
        padding: "60px clamp(24px, 6vw, 100px)",
        position: "relative",
      }}>
        {/* Background image — dog on the right */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/road-trip.jpg"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "right 30%",
            pointerEvents: "none",
          }}
        />
        {/* Dark overlay — stronger on left (text) lighter on right (dog visible) */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(10,10,20,0.75) 0%, rgba(10,10,20,0.55) 50%, rgba(10,10,20,0.15) 100%)",
          pointerEvents: "none",
        }} />

        {/* Content — left-aligned, max 60% of viewport on wide screens */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", alignItems: "flex-start",
          width: "100%", maxWidth: "min(720px, 62vw)",
        }}>
          <h1 style={{
            fontFamily: "var(--font-nunito, 'Nunito'), sans-serif",
            fontWeight: 900, fontSize: "clamp(34px, 4.5vw, 64px)",
            color: "#FFFFFF", lineHeight: 1.08,
            marginBottom: "20px",
            /* Reduced from -1.5px — aggressive negative tracking looks bad on Windows 96dpi */
            letterSpacing: "-0.03em",
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
          }}>
            Tous les hôtels{" "}
            <span style={{ color: "#F09070" }}>sur votre route</span>
          </h1>

          <p style={{
            fontSize: "clamp(15px, 1.6vw, 19px)", color: "rgba(255,255,255,0.85)",
            maxWidth: "500px", lineHeight: 1.65, marginBottom: "48px",
          }}>
            Entrez votre itinéraire. On calcule la route et affiche chaque hébergement disponible sur le chemin — avec le prix et le détour.
          </p>

          {/* Search bar hero */}
          <div id="search" style={{ width: "100%" }}>
            <SearchBar onSearch={handleSearch} loading={false} />
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", opacity: 0.6 }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", letterSpacing: "1px" }}>COMMENT ÇA MARCHE</span>
          <div style={{ width: "1px", height: "32px", background: "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)" }} />
        </div>
      </section>

      {/* ── TUTORIAL ROUTE ── */}
      <TutorialRoute />

      {/* ── PERSONNALISATION ── */}
      <PersonalizationSection />

      {/* ── CTA FINAL ── */}
      <section style={{
        padding: "80px 24px",
        background: "linear-gradient(135deg, #E8644A 0%, #F09070 50%, #6FA8C0 100%)",
        textAlign: "center",
      }}>
        <h2 style={{
          fontFamily: "var(--font-nunito, 'Nunito'), sans-serif",
          fontWeight: 900, fontSize: "clamp(28px, 3vw, 44px)",
          color: "#FFFFFF", marginBottom: "16px", letterSpacing: "-0.02em",
        }}>
          Prêt pour votre prochain road trip ?
        </h2>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.85)", marginBottom: "36px" }}>
          Entrez votre itinéraire ci-dessous — c'est tout.
        </p>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <SearchBar onSearch={handleSearch} loading={false} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "24px 32px", background: "#1E1E2E",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <span style={{ fontFamily: "var(--font-nunito, 'Nunito'), sans-serif", fontWeight: 800, fontSize: "15px", color: "#E8644A" }}>
          KipWay
        </span>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
          © 2025 KipWay · Données cartographiques OpenStreetMap
        </span>
      </footer>
    </div>
  );
}
