"use client";

import { useState } from "react";
import { MapPin, ArrowRight, Search, Users } from "lucide-react";

export default function HeroSection() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: trigger route search
  };

  return (
    <section
      id="hero-search"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "linear-gradient(160deg, #FFF5F2 0%, #F0F9FF 50%, #F0FFF8 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,98,64,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,180,216,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,214,160,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Road illustration pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255,98,64,0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0,180,216,0.05) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "64px",
          alignItems: "center",
        }}
        className="hero-grid"
      >
        {/* Left: Text + Search */}
        <div>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(255, 98, 64, 0.1)",
              color: "var(--brand)",
              borderRadius: "100px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "24px",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            <MapPin size={13} />
            Road trip simplifié
          </div>

          <h1
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontWeight: 900,
              fontSize: "clamp(36px, 5vw, 60px)",
              color: "var(--text)",
              lineHeight: 1.1,
              marginBottom: "20px",
              letterSpacing: "-1px",
            }}
          >
            Trouvez l'hôtel parfait{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FF6240, #FF8A6E)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              sur votre route
            </span>
          </h1>

          <p
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "18px",
              color: "var(--text-muted)",
              lineHeight: 1.7,
              marginBottom: "40px",
              maxWidth: "480px",
            }}
          >
            Paris → Annecy ? Bordeaux → Nice ? Entrez votre itinéraire et découvrez
            instantanément tous les hôtels disponibles le long de votre parcours.
            Comparez, choisissez, partez.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            style={{
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "8px",
              boxShadow: "0 8px 40px rgba(26, 26, 46, 0.12), 0 2px 8px rgba(26,26,46,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {/* Origin */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                borderRadius: "14px",
                backgroundColor: "rgba(248, 247, 244, 0.8)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 98, 64, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MapPin size={15} color="var(--brand)" />
              </div>
              <input
                type="text"
                placeholder="D'où partez-vous ? (ex : Paris)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "15px",
                  color: "var(--text)",
                  outline: "none",
                  width: "100%",
                }}
              />
            </div>

            {/* Route connector */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                paddingLeft: "28px",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "1px",
                  height: "20px",
                  background: "repeating-linear-gradient(to bottom, rgba(26,26,46,0.15) 0px, rgba(26,26,46,0.15) 4px, transparent 4px, transparent 8px)",
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontWeight: 500,
                }}
              >
                via la route
              </span>
            </div>

            {/* Destination */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                borderRadius: "14px",
                backgroundColor: "rgba(248, 247, 244, 0.8)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(0, 180, 216, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MapPin size={15} color="var(--sky)" />
              </div>
              <input
                type="text"
                placeholder="Où allez-vous ? (ex : Annecy)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "15px",
                  color: "var(--text)",
                  outline: "none",
                  width: "100%",
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #FF6240, #FF8A6E)",
                color: "white",
                border: "none",
                borderRadius: "14px",
                padding: "16px 24px",
                fontFamily: "var(--font-nunito), sans-serif",
                fontWeight: 800,
                fontSize: "16px",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(255, 98, 64, 0.35)",
                transition: "transform 0.2s, box-shadow 0.2s",
                marginTop: "4px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(255,98,64,0.45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(255,98,64,0.35)";
              }}
            >
              <Search size={18} />
              Voir les hôtels sur ma route
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Social proof */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginTop: "24px",
            }}
          >
            <div style={{ display: "flex" }}>
              {["#FF6240", "#00B4D8", "#06D6A0", "#FFD166", "#FF6240"].map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    border: "2px solid white",
                    marginLeft: i === 0 ? 0 : "-8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={12} color="white" />
                </div>
              ))}
            </div>
            <p
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "13px",
                color: "var(--text-muted)",
              }}
            >
              <strong style={{ color: "var(--text)" }}>+12 000 voyageurs</strong> ont déjà planifié leur road trip
            </p>
          </div>
        </div>

        {/* Right: Visual map preview */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="hero-visual"
        >
          {/* Map card */}
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "white",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(26, 26, 46, 0.15)",
            }}
          >
            {/* Map placeholder */}
            <div
              style={{
                height: "260px",
                background: "linear-gradient(160deg, #E8F4FD 0%, #D4EDE8 50%, #F0F8E8 100%)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* Stylized route illustration */}
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 460 260"
                style={{ position: "absolute", inset: 0 }}
              >
                {/* Route path */}
                <path
                  d="M 60 200 Q 120 180 160 160 Q 220 130 260 110 Q 320 80 380 60"
                  stroke="#FF6240"
                  strokeWidth="4"
                  strokeDasharray="8 4"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Hotel markers */}
                {[
                  { x: 160, y: 160, color: "#FF6240" },
                  { x: 260, y: 110, color: "#00B4D8" },
                  { x: 340, y: 72, color: "#06D6A0" },
                ].map((m, i) => (
                  <g key={i}>
                    <circle cx={m.x} cy={m.y} r="18" fill="white" opacity="0.9" />
                    <circle cx={m.x} cy={m.y} r="14" fill={m.color} opacity="0.2" />
                    <circle cx={m.x} cy={m.y} r="7" fill={m.color} />
                  </g>
                ))}
                {/* Start */}
                <circle cx="60" cy="200" r="8" fill="#1A1A2E" />
                <circle cx="60" cy="200" r="14" fill="#1A1A2E" opacity="0.15" />
                {/* End */}
                <circle cx="390" cy="55" r="8" fill="#FF6240" />
                <circle cx="390" cy="55" r="14" fill="#FF6240" opacity="0.15" />
              </svg>

              {/* Distance badge */}
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "8px 14px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "18px" }}>🚗</span>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-nunito), sans-serif" }}>547 km</p>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-inter), sans-serif" }}>5h 20min</p>
                </div>
              </div>
            </div>

            {/* Hotel results preview */}
            <div style={{ padding: "16px" }}>
              <p
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "var(--text)",
                  marginBottom: "12px",
                }}
              >
                24 hôtels trouvés sur votre route
              </p>
              {[
                { name: "Hôtel Le Dauphiné", price: "89€", rating: "4.7", dist: "0.8 km de la route", color: "#FF6240" },
                { name: "Résidence du Lac", price: "124€", rating: "4.9", dist: "1.2 km de la route", color: "#00B4D8" },
                { name: "Auberge des Alpes", price: "67€", rating: "4.5", dist: "2.1 km de la route", color: "#06D6A0" },
              ].map((hotel, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    backgroundColor: "rgba(248, 247, 244, 0.8)",
                    borderRadius: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: `${hotel.color}20`,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                    }}
                  >
                    🏨
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "13px", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {hotel.name}
                    </p>
                    <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "var(--text-muted)" }}>
                      ⭐ {hotel.rating} · {hotel.dist}
                    </p>
                  </div>
                  <span style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 800, fontSize: "15px", color: hotel.color, flexShrink: 0 }}>
                    {hotel.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating chips */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "-20px",
              backgroundColor: "white",
              borderRadius: "14px",
              padding: "10px 16px",
              boxShadow: "0 8px 24px rgba(26,26,46,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🎉</span>
            <div>
              <p style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "12px", color: "var(--text)" }}>Économisez 30%</p>
              <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "var(--text-muted)" }}>vs réservation directe</p>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "40px",
              right: "-10px",
              backgroundColor: "white",
              borderRadius: "14px",
              padding: "10px 16px",
              boxShadow: "0 8px 24px rgba(26,26,46,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🗺️</span>
            <div>
              <p style={{ fontFamily: "var(--font-nunito), sans-serif", fontWeight: 700, fontSize: "12px", color: "var(--text)" }}>Carte interactive</p>
              <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "11px", color: "var(--text-muted)" }}>Tous les hôtels visibles</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .hero-visual {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
