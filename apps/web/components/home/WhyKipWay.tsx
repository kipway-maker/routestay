"use client";

export default function WhyKipWay() {
  return (
    <section style={{
      background: "#F8F7F4",
      padding: "80px clamp(24px, 6vw, 80px)",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Titre section */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(232,100,74,0.08)",
            border: "1px solid rgba(232,100,74,0.2)",
            borderRadius: "20px", padding: "5px 14px",
            marginBottom: "14px",
          }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#E8644A", letterSpacing: "1px", textTransform: "uppercase" }}>
              Pourquoi KipWay
            </span>
          </div>
          <h2 style={{
            fontFamily: "var(--font-nunito, 'Nunito'), sans-serif",
            fontWeight: 900, fontSize: "clamp(26px, 3vw, 40px)",
            color: "#1E1E2E", letterSpacing: "-0.02em", margin: 0,
          }}>
            Simple, rapide, fait pour la route.
          </h2>
        </div>

        {/* Bento grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "auto auto",
          gap: "14px",
        }}>

          {/* Grande carte — col 1+2, row 1+2 */}
          <div style={{
            gridColumn: "1 / 3",
            gridRow: "1 / 3",
            background: "#1E1E2E",
            borderRadius: "20px",
            padding: "40px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            minHeight: "320px",
            position: "relative", overflow: "hidden",
          }}>
            {/* Halo décoratif */}
            <div style={{
              position: "absolute", bottom: "-60px", right: "-60px",
              width: "280px", height: "280px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(232,100,74,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div>
              <div style={{ fontSize: "36px", marginBottom: "20px" }}>📍</div>
              <h3 style={{
                fontFamily: "var(--font-nunito, 'Nunito'), sans-serif",
                fontWeight: 900, fontSize: "clamp(20px, 2.2vw, 28px)",
                color: "#FFFFFF", lineHeight: 1.2, marginBottom: "14px",
                letterSpacing: "-0.02em",
              }}>
                Trouvez un hôtel<br />sur votre route en<br />quelques secondes.
              </h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: "340px" }}>
                Entrez départ et arrivée. KipWay calcule votre trajet et affiche chaque hébergement disponible sur le chemin, avec le prix et le détour exact.
              </p>
            </div>
            {/* Stats row */}
            <div style={{ display: "flex", gap: "28px", marginTop: "32px" }}>
              {[
                { val: "100%", label: "Gratuit" },
                { val: "<30s", label: "Résultats" },
                { val: "0", label: "Inscription" },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: "var(--font-nunito, 'Nunito'), sans-serif", fontWeight: 900, fontSize: "22px", color: "#E8644A" }}>{s.val}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Carte top-right : Sans appli */}
          <div style={{
            gridColumn: "3 / 4",
            gridRow: "1 / 2",
            background: "#FFFFFF",
            borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.07)",
            padding: "28px",
            display: "flex", flexDirection: "column", gap: "10px",
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "rgba(111,168,192,0.12)",
              border: "1px solid rgba(111,168,192,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px",
            }}>📱</div>
            <div style={{ fontFamily: "var(--font-nunito, 'Nunito'), sans-serif", fontWeight: 800, fontSize: "16px", color: "#1E1E2E" }}>
              Aucune app à installer
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6 }}>
              Fonctionne directement dans votre navigateur, sur mobile comme sur desktop.
            </div>
          </div>

          {/* Carte bottom-right : Données temps réel */}
          <div style={{
            gridColumn: "3 / 4",
            gridRow: "2 / 3",
            background: "#E8644A",
            borderRadius: "20px",
            padding: "28px",
            display: "flex", flexDirection: "column", gap: "10px",
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px",
            }}>⚡</div>
            <div style={{ fontFamily: "var(--font-nunito, 'Nunito'), sans-serif", fontWeight: 800, fontSize: "16px", color: "#FFFFFF" }}>
              Données en temps réel
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
              Prix et disponibilités mis à jour en direct via les plateformes partenaires.
            </div>
          </div>

          {/* Carte bottom-left : Détour calculé */}
          <div style={{
            gridColumn: "1 / 2",
            gridRow: "3 / 4",
            background: "#FFFFFF",
            borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.07)",
            padding: "28px",
            display: "flex", flexDirection: "column", gap: "10px",
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "rgba(255,209,102,0.15)",
              border: "1px solid rgba(255,209,102,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px",
            }}>🗺️</div>
            <div style={{ fontFamily: "var(--font-nunito, 'Nunito'), sans-serif", fontWeight: 800, fontSize: "16px", color: "#1E1E2E" }}>
              Détour calculé à la minute
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6 }}>
              Chaque hôtel affiche le temps de détour exact depuis votre route.
            </div>
          </div>

          {/* Carte bottom-center : Prix transparents */}
          <div style={{
            gridColumn: "2 / 3",
            gridRow: "3 / 4",
            background: "rgba(6,214,160,0.08)",
            borderRadius: "20px",
            border: "1px solid rgba(6,214,160,0.2)",
            padding: "28px",
            display: "flex", flexDirection: "column", gap: "10px",
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "rgba(6,214,160,0.15)",
              border: "1px solid rgba(6,214,160,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px",
            }}>💶</div>
            <div style={{ fontFamily: "var(--font-nunito, 'Nunito'), sans-serif", fontWeight: 800, fontSize: "16px", color: "#1E1E2E" }}>
              Prix transparents
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6 }}>
              Le prix affiché est le prix réel. Pas de frais cachés, pas de surprise.
            </div>
          </div>

          {/* Carte bottom-right : Sans compte */}
          <div style={{
            gridColumn: "3 / 4",
            gridRow: "3 / 4",
            background: "#FFFFFF",
            borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.07)",
            padding: "28px",
            display: "flex", flexDirection: "column", gap: "10px",
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "rgba(167,139,250,0.12)",
              border: "1px solid rgba(167,139,250,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px",
            }}>🔓</div>
            <div style={{ fontFamily: "var(--font-nunito, 'Nunito'), sans-serif", fontWeight: 800, fontSize: "16px", color: "#1E1E2E" }}>
              Sans compte, sans e-mail
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6 }}>
              Aucune inscription requise. Vous cherchez, c'est tout.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
