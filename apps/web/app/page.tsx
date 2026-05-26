"use client";

import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import TutorialRoute from "@/components/home/TutorialRoute";

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
    <div style={{ height: "100vh", overflowY: "auto", overflowX: "hidden", background: "#F8F7F4", fontFamily: "var(--font-inter), sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(248,247,244,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        padding: "0 32px", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "10px",
            background: "linear-gradient(135deg, #FF6240, #FF8A6E)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px",
            boxShadow: "0 3px 10px rgba(255,98,64,0.3)",
          }}>🗺️</div>
          <span style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: "18px", color: "#FF6240" }}>RouteStay</span>
        </div>
        <a
          href="#search"
          style={{
            padding: "8px 20px", borderRadius: "20px",
            background: "#FF6240", color: "#FFFFFF",
            fontSize: "13px", fontWeight: 700,
            textDecoration: "none",
            fontFamily: "var(--font-nunito), sans-serif",
            boxShadow: "0 4px 14px rgba(255,98,64,0.3)",
          }}
        >
          Commencer →
        </a>
      </header>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "60px 24px",
        textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/road-trip.jpg"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 30%",
            pointerEvents: "none",
          }}
        />
        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(10,10,20,0.52) 0%, rgba(10,10,20,0.38) 60%, rgba(10,10,20,0.65) 100%)",
          pointerEvents: "none",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontWeight: 900, fontSize: "clamp(38px, 5.5vw, 68px)",
            color: "#FFFFFF", lineHeight: 1.08,
            marginBottom: "20px", maxWidth: "720px",
            letterSpacing: "-1.5px",
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
          }}>
            Tous les hôtels{" "}
            <span style={{ color: "#FF8A6E" }}>sur votre route</span>
          </h1>

          <p style={{
            fontSize: "clamp(16px, 2vw, 19px)", color: "rgba(255,255,255,0.82)",
            maxWidth: "500px", lineHeight: 1.65, marginBottom: "48px",
          }}>
            Entrez votre itinéraire. On calcule la route et affiche chaque hébergement disponible sur le chemin — avec le prix et le détour.
          </p>

          {/* Search bar hero */}
          <div id="search" style={{ width: "100%", maxWidth: "620px" }}>
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

      {/* ── CTA FINAL ── */}
      <section style={{
        padding: "80px 24px",
        background: "linear-gradient(135deg, #FF6240 0%, #FF8A6E 50%, #FFB347 100%)",
        textAlign: "center",
      }}>
        <h2 style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontWeight: 900, fontSize: "clamp(28px, 3vw, 44px)",
          color: "#FFFFFF", marginBottom: "16px", letterSpacing: "-0.5px",
        }}>
          Prêt pour votre prochain road trip ?
        </h2>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.85)", marginBottom: "36px" }}>
          Entrez votre itinéraire ci-dessous — c'est tout.
        </p>
        <div style={{ maxWidth: "580px", margin: "0 auto" }}>
          <SearchBar onSearch={handleSearch} loading={false} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "24px 32px", background: "#1A1A2E",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <span style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: "15px", color: "#FF6240" }}>
          RouteStay
        </span>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
          © 2025 RouteStay · Données cartographiques OpenStreetMap
        </span>
      </footer>
    </div>
  );
}
