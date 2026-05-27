"use client";

import { Hotel, TrendingDown, MousePointerClick } from "lucide-react";

const features = [
  {
    icon: Hotel,
    color: "#FF6240",
    bgColor: "rgba(255, 98, 64, 0.1)",
    title: "Tous les hôtels sur votre route",
    description:
      "Notre algorithme analyse votre trajet kilométrique et référence chaque hôtel dans un rayon de 0 à 30 km de votre parcours. Fini les détours inutiles.",
    stat: "50 000+",
    statLabel: "hôtels référencés",
  },
  {
    icon: TrendingDown,
    color: "#00B4D8",
    bgColor: "rgba(0, 180, 216, 0.1)",
    title: "Comparez les prix en temps réel",
    description:
      "KipWay agrège les offres de Booking, Expedia, Hotels.com et plus encore. Vous voyez les meilleurs prix disponibles instantanément, sans aller-retour entre les sites.",
    stat: "15+",
    statLabel: "plateformes comparées",
  },
  {
    icon: MousePointerClick,
    color: "#06D6A0",
    bgColor: "rgba(6, 214, 160, 0.1)",
    title: "Réservez en un clic",
    description:
      "Trouvé l'hôtel parfait ? Un clic suffit pour être redirigé vers la page de réservation directe. Simple, rapide, sans friction.",
    stat: "3 min",
    statLabel: "pour réserver",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        padding: "100px 24px",
        backgroundColor: "var(--bg)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(0, 180, 216, 0.1)",
              color: "var(--sky)",
              borderRadius: "100px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "16px",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            ✨ Pourquoi KipWay
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
            Le compagnon idéal de vos road trips
          </h2>
          <p
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "18px",
              color: "var(--text-muted)",
              maxWidth: "560px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Plus besoin de jongler entre Google Maps et les sites de réservation.
            KipWay fait tout ça pour vous, en une seule interface.
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
          className="features-grid"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderRadius: "24px",
                  padding: "32px",
                  boxShadow: "0 4px 20px rgba(26, 26, 46, 0.06)",
                  border: "1px solid rgba(26, 26, 46, 0.05)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(26,26,46,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(26,26,46,0.06)";
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    backgroundColor: feature.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <Icon size={24} color={feature.color} strokeWidth={2} />
                </div>

                {/* Stat */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "baseline",
                    gap: "6px",
                    backgroundColor: feature.bgColor,
                    borderRadius: "10px",
                    padding: "4px 12px",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-nunito), sans-serif",
                      fontWeight: 900,
                      fontSize: "18px",
                      color: feature.color,
                    }}
                  >
                    {feature.stat}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: "12px",
                      color: feature.color,
                      fontWeight: 600,
                    }}
                  >
                    {feature.statLabel}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-nunito), sans-serif",
                    fontWeight: 800,
                    fontSize: "20px",
                    color: "var(--text)",
                    marginBottom: "12px",
                    lineHeight: 1.3,
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: "15px",
                    color: "var(--text-muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 600px) and (max-width: 900px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
