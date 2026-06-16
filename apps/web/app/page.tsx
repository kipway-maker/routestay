"use client";

import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import TutorialRoute from "@/components/home/TutorialRoute";

interface Place { name: string; lat: number; lng: number; }

export default function HomePage() {
  const router = useRouter();

  function handleSearch(origin: Place, destination: Place, departureDate: string) {
    const params = new URLSearchParams({
      fromName: origin.name, fromLat: String(origin.lat), fromLng: String(origin.lng),
      toName: destination.name, toLat: String(destination.lat), toLng: String(destination.lng),
      date: departureDate,
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div style={{ height: "100vh", overflowY: "auto", overflowX: "hidden", scrollbarGutter: "stable", background: "#D6EEFF", fontFamily: "var(--font-inter,'Inter'),sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(214,238,255,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "0 clamp(24px,6vw,80px)", height: "150px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #E8644A, #F09070, #6FA8C0)" }} />
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-kipway-v3.png" alt="KipWay" style={{ height: "130px", width: "auto" }} />
        </a>
      </header>

      <div style={{ position: "relative" }}>
        <TutorialRoute hideHeader />

        <div style={{
          position: "absolute",
          top: "calc(11.25vw + 220px)",
          left: 0, right: 0,
          zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center",
          padding: "0 clamp(24px,6vw,80px)",
          pointerEvents: "none",
        }}>
          <h1 style={{
            fontFamily: "var(--font-nunito,'Nunito'),sans-serif",
            fontWeight: 900,
            fontSize: "clamp(34px, 4.5vw, 64px)",
            color: "#1E1E2E",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            marginBottom: "16px",
            pointerEvents: "none",
          }}>
            Tous les hôtels{" "}
            <span style={{ color: "#E8644A" }}>sur votre route</span>
          </h1>
          <p style={{
            fontSize: "clamp(15px, 1.4vw, 18px)",
            color: "#4A6FA0",
            maxWidth: "500px",
            lineHeight: 1.65,
            marginBottom: "28px",
            pointerEvents: "none",
          }}>
            Entrez deux villes. La route s&apos;affiche, les hôtels avec.
          </p>
          <div style={{ width: "100%", maxWidth: "860px", pointerEvents: "all" }}>
            <SearchBar onSearch={handleSearch} loading={false} />
          </div>
        </div>
      </div>

      <div style={{ height: "80px", background: "linear-gradient(to bottom, #FFD4A8, #E8644A)" }} />

      {/* ── CTA FINAL ── */}
      <section id="cta" style={{
        background: "#E8644A",
        padding: "60px clamp(24px,6vw,80px) 80px",
        textAlign: "center",
      }}>
        <h2 style={{
          fontFamily: "var(--font-nunito,'Nunito'),sans-serif",
          fontWeight: 900, fontSize: "clamp(28px,3vw,48px)",
          color: "#fff", marginBottom: "12px", letterSpacing: "-0.02em",
        }}>
          Prêt pour votre prochain road trip ?
        </h2>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.75)", marginBottom: "40px" }}>
          Entrez votre itinéraire ci-dessous. C&apos;est tout.
        </p>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <SearchBar onSearch={handleSearch} loading={false} />
        </div>
      </section>

      <div style={{ height: "80px", background: "linear-gradient(to bottom, #E8644A, #F8F7F4)" }} />

      {/* ── FOOTER ── */}
      <footer style={{ background: "#F8F7F4", fontFamily: "var(--font-inter,'Inter'),sans-serif" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "56px clamp(24px,6vw,80px) 0" }}>
          <div style={{
            background: "#fff", borderRadius: "24px",
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
            display: "flex", alignItems: "center",
            padding: "48px 56px", gap: "48px", overflow: "hidden", position: "relative",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#E8644A", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
                Vous gérez un hébergement ?
              </div>
              <h3 style={{
                fontFamily: "var(--font-nunito,'Nunito'),sans-serif",
                fontWeight: 900, fontSize: "clamp(22px,2.5vw,32px)",
                color: "#1E1E2E", marginBottom: "12px", lineHeight: 1.15, letterSpacing: "-0.02em",
              }}>
                Référencez votre établissement sur KipWay
              </h3>
              <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7, marginBottom: "28px", maxWidth: "460px" }}>
                Hôtel, auberge, chambre d&apos;hôtes, gîte : rejoignez KipWay et soyez visible auprès des voyageurs road trip.
              </p>
              <a href="mailto:contact@kipway.fr" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "13px 24px", borderRadius: "50px",
                background: "#1E1E2E", color: "#fff",
                fontSize: "14px", fontWeight: 700, textDecoration: "none",
                fontFamily: "var(--font-nunito,'Nunito'),sans-serif",
              }}>
                Nous contacter ↗
              </a>
            </div>
            <div style={{ flexShrink: 0, width: "220px", height: "180px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", width: "180px", height: "180px", borderRadius: "50%", border: "1px dashed rgba(232,100,74,0.2)" }} />
              <div style={{ position: "absolute", width: "110px", height: "110px", borderRadius: "50%", border: "1px dashed rgba(232,100,74,0.15)" }} />
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg,#E8644A,#F09070)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 8px 24px rgba(232,100,74,0.35)", zIndex: 1 }}>📍</div>
              {[{ icon: "🏨", x: "50%", y: "6%" }, { icon: "🛖", x: "84%", y: "38%" }, { icon: "🏡", x: "70%", y: "80%" }, { icon: "🏕️", x: "14%", y: "72%" }, { icon: "🏩", x: "8%", y: "28%" }].map((item, i) => (
                <div key={i} style={{ position: "absolute", left: item.x, top: item.y, transform: "translate(-50%,-50%)", width: "40px", height: "40px", borderRadius: "50%", background: "#fff", border: "1.5px solid rgba(232,100,74,0.2)", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                  {item.icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px clamp(24px,6vw,80px) 32px", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.4fr", gap: "clamp(24px,5vw,60px)", alignItems: "start" }}>
          <div>
            <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.7, marginBottom: "16px", maxWidth: "220px" }}>Tous les hôtels sur votre route, avec le prix et le détour.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon-kipway.png" alt="KipWay" style={{ width: "200px", height: "200px", objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>Produit</div>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[{ label: "Accueil", href: "/" }, { label: "Comment ça marche", href: "#" }, { label: "Référencer mon hébergement ↗", href: "mailto:contact@kipway.fr" }].map(l => (
                <a key={l.label} href={l.href} style={{ fontSize: "13px", color: "#6B7280", textDecoration: "none" }}>{l.label}</a>
              ))}
            </nav>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>Légal</div>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Mentions légales", "CGU", "Confidentialité", "Cookies"].map(l => (
                <a key={l} href="#" style={{ fontSize: "13px", color: "#6B7280", textDecoration: "none" }}>{l}</a>
              ))}
            </nav>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>Newsletter</div>
            <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, marginBottom: "16px" }}>Nouveautés, destinations et offres exclusives.</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input type="email" placeholder="Votre email..." style={{ flex: 1, minWidth: 0, padding: "10px 16px", borderRadius: "50px", border: "1.5px solid #e5e7eb", fontSize: "13px", color: "#1E1E2E", background: "#fff", outline: "none" }} />
              <button style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1E1E2E", color: "#fff", border: "none", cursor: "pointer", fontSize: "16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", padding: "16px clamp(24px,6vw,80px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>© 2025 KipWay · Tous droits réservés</span>
          <span style={{ fontSize: "12px", color: "#D1D5DB" }}>Données cartographiques © OpenStreetMap contributors</span>
          <span style={{ fontSize: "12px", color: "#D1D5DB" }}>🔗 Liens partenaires — KipWay perçoit une commission sur les réservations effectuées via ses liens, sans surcoût pour vous.</span>
        </div>
      </footer>

    </div>
  );
}
