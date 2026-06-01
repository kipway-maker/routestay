"use client";

import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import TutorialRoute from "@/components/home/TutorialRoute";
import WhyKipWay from "@/components/home/WhyKipWay";
// import PersonalizationSection from "@/components/home/PersonalizationSection";

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
            Entrez votre itinéraire. On calcule la route et affiche chaque hébergement disponible sur le chemin, avec le prix et le détour.
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

      {/* ── POURQUOI KIPWAY ── */}
      {/* <WhyKipWay /> */}

      {/* Transition Tutorial → corail */}
      <div style={{ height: "80px", background: "linear-gradient(to bottom, #FFD4A8, #E8644A)", display: "block" }} />

      {/* ── CTA FINAL ── */}
      <section style={{
        background: "#E8644A",
        padding: "60px clamp(24px, 6vw, 80px) 80px",
        textAlign: "center",
      }}>
        <h2 style={{
          fontFamily: "var(--font-nunito, 'Nunito'), sans-serif",
          fontWeight: 900, fontSize: "clamp(28px, 3vw, 48px)",
          color: "#FFFFFF", marginBottom: "12px", letterSpacing: "-0.02em",
        }}>
          Prêt pour votre prochain road trip ?
        </h2>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.75)", marginBottom: "40px" }}>
          Entrez votre itinéraire ci-dessous. C'est tout.
        </p>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <SearchBar onSearch={handleSearch} loading={false} />
        </div>
      </section>

      {/* Transition corail → clair */}
      <div style={{ height: "80px", background: "linear-gradient(to bottom, #E8644A, #F8F7F4)", display: "block" }} />

      {/* ── FOOTER ── */}
      <footer style={{ background: "#F8F7F4", fontFamily: "var(--font-inter, 'Inter'), sans-serif" }}>

        {/* ── Affiliate card ── */}
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "56px clamp(24px, 6vw, 80px) 0" }}>
          <div style={{
            background: "#FFFFFF",
            borderRadius: "24px",
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
            display: "flex", alignItems: "center",
            padding: "48px 56px",
            gap: "48px",
            overflow: "hidden",
            position: "relative",
          }}>
            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#E8644A", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
                Vous gérez un hébergement ?
              </div>
              <h3 style={{
                fontFamily: "var(--font-nunito, 'Nunito'), sans-serif",
                fontWeight: 900, fontSize: "clamp(22px, 2.5vw, 32px)",
                color: "#1E1E2E", marginBottom: "12px", lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}>
                Référencez votre établissement sur KipWay
              </h3>
              <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7, marginBottom: "28px", maxWidth: "460px" }}>
                Hôtel, auberge, chambre d'hôtes, gîte : rejoignez KipWay et soyez visible auprès des voyageurs road trip au moment exact où ils cherchent à s'arrêter.
              </p>
              <a
                href="mailto:contact@kipway.fr"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "13px 24px", borderRadius: "50px",
                  background: "#1E1E2E", color: "#FFFFFF",
                  fontSize: "14px", fontWeight: 700,
                  textDecoration: "none",
                  fontFamily: "var(--font-nunito, 'Nunito'), sans-serif",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#E8644A")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#1E1E2E")}
              >
                Nous contacter ↗
              </a>
            </div>

            {/* Visual — pin network */}
            <div style={{ flexShrink: 0, width: "260px", height: "220px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Orbits */}
              <div style={{ position: "absolute", width: "200px", height: "200px", borderRadius: "50%", border: "1px dashed rgba(232,100,74,0.2)" }} />
              <div style={{ position: "absolute", width: "130px", height: "130px", borderRadius: "50%", border: "1px dashed rgba(232,100,74,0.15)" }} />
              {/* Center pin */}
              <div style={{
                width: "52px", height: "52px", borderRadius: "50%",
                background: "linear-gradient(135deg, #E8644A, #F09070)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", boxShadow: "0 8px 24px rgba(232,100,74,0.35)",
                zIndex: 1,
              }}>📍</div>
              {/* Orbiting icons */}
              {[
                { icon: "🏨", x: "50%", y: "6%", label: "Hôtel" },
                { icon: "🛖", x: "84%", y: "38%", label: "Gîte" },
                { icon: "🏡", x: "70%", y: "80%", label: "Chambre d'hôtes" },
                { icon: "🏕️", x: "14%", y: "72%", label: "Camping" },
                { icon: "🏩", x: "8%", y: "28%", label: "Auberge" },
              ].map((item, i) => (
                <div key={i} style={{
                  position: "absolute",
                  left: item.x, top: item.y,
                  transform: "translate(-50%, -50%)",
                  width: "44px", height: "44px", borderRadius: "50%",
                  background: "#FFFFFF",
                  border: "1.5px solid rgba(232,100,74,0.2)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px",
                }}>
                  {item.icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer columns ── */}
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          padding: "48px clamp(24px, 6vw, 80px) 32px",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1.4fr",
          gap: "clamp(24px, 5vw, 60px)",
          alignItems: "start",
        }}>

          {/* Brand */}
          <div>
            <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.7, marginBottom: "16px", maxWidth: "220px" }}>
              Tous les hôtels sur votre route, avec le prix et le détour.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon-kipway.png" alt="KipWay" style={{ width: "200px", height: "200px", objectFit: "contain" }} />
          </div>

          {/* Produit */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>
              Produit
            </div>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Accueil", href: "/" },
                { label: "Comment ça marche", href: "#search" },
                { label: "Personnalisation", href: "#search" },
                { label: "Référencer mon hébergement ↗", href: "mailto:contact@kipway.fr" },
              ].map((link) => (
                <a key={link.label} href={link.href} style={{ fontSize: "13px", color: "#6B7280", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#E8644A")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#6B7280")}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Légal */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>
              Légal
            </div>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Mentions légales", href: "#" },
                { label: "CGU", href: "#" },
                { label: "Confidentialité", href: "#" },
                { label: "Cookies", href: "#" },
              ].map((link) => (
                <a key={link.label} href={link.href} style={{ fontSize: "13px", color: "#6B7280", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#E8644A")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#6B7280")}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>
              Newsletter
            </div>
            <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, marginBottom: "16px" }}>
              Nouveautés, destinations et offres exclusives.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="email"
                placeholder="Votre email..."
                style={{
                  flex: 1, minWidth: 0,
                  padding: "10px 16px",
                  borderRadius: "50px",
                  border: "1.5px solid #e5e7eb",
                  fontSize: "13px", color: "#1E1E2E",
                  background: "#FFFFFF",
                  outline: "none",
                  fontFamily: "var(--font-inter, 'Inter'), sans-serif",
                }}
              />
              <button style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: "#1E1E2E", color: "#FFFFFF",
                border: "none", cursor: "pointer",
                fontSize: "16px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#E8644A")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1E1E2E")}
              >→</button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(0,0,0,0.07)",
          padding: "16px clamp(24px, 6vw, 80px)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "8px",
        }}>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
            © 2025 KipWay · Tous droits réservés
          </span>
          <span style={{ fontSize: "12px", color: "#D1D5DB" }}>
            Données cartographiques © OpenStreetMap contributors
          </span>
        </div>

      </footer>
    </div>
  );
}
