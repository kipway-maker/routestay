"use client";

import { Navigation, Sparkles, CalendarCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Navigation,
    color: "#FF6240",
    bgColor: "rgba(255, 98, 64, 0.1)",
    gradientFrom: "#FF6240",
    gradientTo: "#FF8A6E",
    title: "Entrez votre itinéraire",
    description:
      "Saisissez votre ville de départ et votre destination. Ajoutez des étapes intermédiaires si besoin. Notre moteur calcule votre trajet optimal en quelques secondes.",
    tip: "Fonctionne aussi pour les longs trajets de plusieurs jours",
  },
  {
    number: "02",
    icon: Sparkles,
    color: "#00B4D8",
    bgColor: "rgba(0, 180, 216, 0.1)",
    gradientFrom: "#00B4D8",
    gradientTo: "#48CAE4",
    title: "Découvrez les hôtels",
    description:
      "KipWay affiche sur une carte interactive tous les hôtels disponibles le long de votre route. Filtrez par prix, note, distance ou équipements.",
    tip: "Filtres avancés : piscine, parking, animaux acceptés, wifi...",
  },
  {
    number: "03",
    icon: CalendarCheck,
    color: "#06D6A0",
    bgColor: "rgba(6, 214, 160, 0.1)",
    gradientFrom: "#06D6A0",
    gradientTo: "#0CB87D",
    title: "Choisissez et réservez",
    description:
      "Sélectionnez l'hôtel qui vous convient et réservez directement via la plateforme partenaire. Vos dates et le nombre de voyageurs sont pré-remplis automatiquement.",
    tip: "Paiement sécurisé via Booking, Expedia ou Hotels.com",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: "100px 24px",
        background: "linear-gradient(180deg, rgba(248,247,244,0) 0%, rgba(240,249,255,0.5) 50%, rgba(240,255,248,0.3) 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,209,102,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(255, 209, 102, 0.15)",
              color: "#B8860B",
              borderRadius: "100px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "16px",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            🚀 Simple & rapide
          </div>
          <h2
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontWeight: 900,
              fontSize: "clamp(28px, 4vw, 46px)",
              color: "var(--text)",
              letterSpacing: "-0.5px",
              marginBottom: "16px",
            }}
          >
            3 étapes, c'est tout
          </h2>
          <p
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "18px",
              color: "var(--text-muted)",
              maxWidth: "500px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            De l'itinéraire à la réservation, KipWay vous guide à chaque étape.
          </p>
        </div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "32px",
            position: "relative",
          }}
          className="steps-grid"
        >
          {/* Connector line */}
          <div
            style={{
              position: "absolute",
              top: "56px",
              left: "calc(16.66% + 28px)",
              right: "calc(16.66% + 28px)",
              height: "2px",
              background: "linear-gradient(90deg, #FF6240, #00B4D8, #06D6A0)",
              borderRadius: "2px",
              zIndex: 0,
            }}
            className="connector-line"
          />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                {/* Step number + icon */}
                <div
                  style={{
                    position: "relative",
                    marginBottom: "24px",
                  }}
                >
                  {/* Outer ring */}
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "24px",
                      background: `linear-gradient(135deg, ${step.gradientFrom}, ${step.gradientTo})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 8px 24px ${step.color}35`,
                    }}
                  >
                    <Icon size={32} color="white" strokeWidth={2} />
                  </div>
                  {/* Number badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      width: "26px",
                      height: "26px",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      border: `2px solid ${step.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-nunito), sans-serif",
                      fontWeight: 900,
                      fontSize: "11px",
                      color: step.color,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "20px",
                    padding: "28px 24px",
                    boxShadow: "0 4px 20px rgba(26,26,46,0.07)",
                    border: "1px solid rgba(26,26,46,0.05)",
                    width: "100%",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-nunito), sans-serif",
                      fontWeight: 800,
                      fontSize: "20px",
                      color: "var(--text)",
                      marginBottom: "12px",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: "15px",
                      color: "var(--text-muted)",
                      lineHeight: 1.7,
                      marginBottom: "16px",
                    }}
                  >
                    {step.description}
                  </p>
                  {/* Tip */}
                  <div
                    style={{
                      backgroundColor: step.bgColor,
                      borderRadius: "10px",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "14px", flexShrink: 0 }}>💡</span>
                    <p
                      style={{
                        fontFamily: "var(--font-inter), sans-serif",
                        fontSize: "12px",
                        color: step.color,
                        fontWeight: 600,
                        lineHeight: 1.5,
                        textAlign: "left",
                      }}
                    >
                      {step.tip}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: "64px" }}>
          <a
            href="#hero-search"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "linear-gradient(135deg, #FF6240, #FF8A6E)",
              color: "white",
              borderRadius: "16px",
              padding: "18px 36px",
              fontFamily: "var(--font-nunito), sans-serif",
              fontWeight: 800,
              fontSize: "18px",
              textDecoration: "none",
              boxShadow: "0 8px 28px rgba(255, 98, 64, 0.35)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(255,98,64,0.45)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(255,98,64,0.35)";
            }}
          >
            <Navigation size={20} />
            Planifier mon road trip maintenant
          </a>
          <p
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "13px",
              color: "var(--text-muted)",
              marginTop: "12px",
            }}
          >
            Gratuit · Sans inscription · Résultats instantanés
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .steps-grid {
            grid-template-columns: 1fr !important;
          }
          .connector-line {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
