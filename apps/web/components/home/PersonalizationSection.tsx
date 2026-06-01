"use client";

const FILTERS = [
  { icon: "💶", label: "Budget maîtrisé", desc: "Filtrez par prix max : < 60 €, < 100 €, < 150 €", color: "#E8644A", angle: -12 },
  { icon: "⚡", label: "Borne EV", desc: "Chargez votre voiture pendant votre nuit", color: "#06D6A0", angle: 5 },
  { icon: "★", label: "Top noté", desc: "Uniquement les hôtels ≥ 4 ou ≥ 4,5 étoiles", color: "#FFD166", angle: -6 },
  { icon: "↗", label: "Sans détour", desc: "Hôtels à moins de 5 min de votre route", color: "#6FA8C0", angle: 9 },
  { icon: "🌙", label: "Accueil 24h", desc: "Arrivée à n'importe quelle heure garantie", color: "#A78BFA", angle: -4 },
];

// Panneau directionnel SVG — style KipWay
function SignpostIllustration() {
  return (
    <svg
      viewBox="0 0 420 520"
      style={{ width: "100%", maxWidth: "420px", height: "auto", display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        {/* Glow corail pour le pin */}
        <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8644A" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E8644A" stopOpacity="0" />
        </radialGradient>
        {/* Texture map en fond */}
        <pattern id="mapGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(111,168,192,0.12)" strokeWidth="0.8"/>
        </pattern>
        {/* Ombre portée panneaux */}
        <filter id="signShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.5)" />
        </filter>
        {/* Ombre portée pin */}
        <filter id="pinShadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="rgba(232,100,74,0.6)" />
        </filter>
        {/* Halo lumineux sol */}
        <radialGradient id="groundGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8644A" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#E8644A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Fond carte ── */}
      <rect x="0" y="0" width="420" height="520" fill="url(#mapGrid)" />

      {/* Routes stylisées en fond */}
      <path d="M 0 320 Q 100 280 210 300 Q 310 320 420 280" fill="none" stroke="rgba(111,168,192,0.2)" strokeWidth="18" strokeLinecap="round" />
      <path d="M 0 360 Q 120 340 210 350 Q 300 360 420 330" fill="none" stroke="rgba(111,168,192,0.1)" strokeWidth="10" strokeLinecap="round" />
      <path d="M 140 0 Q 160 130 210 300" fill="none" stroke="rgba(111,168,192,0.12)" strokeWidth="12" strokeLinecap="round" />
      <path d="M 280 0 Q 260 150 210 300" fill="none" stroke="rgba(111,168,192,0.08)" strokeWidth="8" strokeLinecap="round" />

      {/* Halo au sol */}
      <ellipse cx="210" cy="460" rx="90" ry="24" fill="url(#groundGlow)" />

      {/* ── Poteau ── */}
      <rect x="202" y="120" width="16" height="360" rx="4"
        fill="url(#poleGrad)" />
      <defs>
        <linearGradient id="poleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2A3850" />
          <stop offset="40%" stopColor="#3D5068" />
          <stop offset="100%" stopColor="#1E2D40" />
        </linearGradient>
      </defs>

      {/* ── Panneaux directionnels ── */}

      {/* Panneau 1 — Budget */}
      <g transform="translate(210, 175) rotate(-12)" filter="url(#signShadow)">
        <rect x="-130" y="-26" width="175" height="52" rx="6" fill="#E8644A" />
        <polygon points="-130,-26 -155,0 -130,26" fill="#E8644A" />
        <text x="-100" y="-6" fontFamily="'Segoe UI', system-ui, sans-serif" fontWeight="800" fontSize="13" fill="white">💶 Budget maîtrisé</text>
        <text x="-100" y="12" fontFamily="'Segoe UI', system-ui, sans-serif" fontSize="10" fill="rgba(255,255,255,0.75)">&lt; 60 € / &lt; 100 € / &lt; 150 €</text>
      </g>

      {/* Panneau 2 — EV (droite) */}
      <g transform="translate(210, 235) rotate(7)" filter="url(#signShadow)">
        <rect x="-20" y="-24" width="160" height="48" rx="6" fill="#06D6A0" />
        <polygon points="140,-24 165,0 140,24" fill="#06D6A0" />
        <text x="8" y="-5" fontFamily="'Segoe UI', system-ui, sans-serif" fontWeight="800" fontSize="13" fill="white">⚡ Borne EV</text>
        <text x="8" y="12" fontFamily="'Segoe UI', system-ui, sans-serif" fontSize="10" fill="rgba(255,255,255,0.75)">Chargez en dormant</text>
      </g>

      {/* Panneau 3 — Note (gauche) */}
      <g transform="translate(210, 293) rotate(-5)" filter="url(#signShadow)">
        <rect x="-145" y="-24" width="165" height="48" rx="6" fill="#FFD166" />
        <polygon points="-145,-24 -170,0 -145,24" fill="#FFD166" />
        <text x="-115" y="-5" fontFamily="'Segoe UI', system-ui, sans-serif" fontWeight="800" fontSize="13" fill="#1E1E2E">★ Top noté</text>
        <text x="-115" y="12" fontFamily="'Segoe UI', system-ui, sans-serif" fontSize="10" fill="rgba(30,30,46,0.7)">Uniquement ≥ 4,5 / 5</text>
      </g>

      {/* Panneau 4 — Détour (droite) */}
      <g transform="translate(210, 350) rotate(10)" filter="url(#signShadow)">
        <rect x="-18" y="-24" width="170" height="48" rx="6" fill="#6FA8C0" />
        <polygon points="152,-24 177,0 152,24" fill="#6FA8C0" />
        <text x="10" y="-5" fontFamily="'Segoe UI', system-ui, sans-serif" fontWeight="800" fontSize="13" fill="white">↗ Sans détour</text>
        <text x="10" y="12" fontFamily="'Segoe UI', system-ui, sans-serif" fontSize="10" fill="rgba(255,255,255,0.75)">≤ 5 min de votre route</text>
      </g>

      {/* Panneau 5 — 24h (gauche) */}
      <g transform="translate(210, 408) rotate(-8)" filter="url(#signShadow)">
        <rect x="-148" y="-24" width="168" height="48" rx="6" fill="#A78BFA" />
        <polygon points="-148,-24 -173,0 -148,24" fill="#A78BFA" />
        <text x="-118" y="-5" fontFamily="'Segoe UI', system-ui, sans-serif" fontWeight="800" fontSize="13" fill="white">🌙 Accueil 24h</text>
        <text x="-118" y="12" fontFamily="'Segoe UI', system-ui, sans-serif" fontSize="10" fill="rgba(255,255,255,0.75)">Arrivée à toute heure</text>
      </g>

      {/* ── KipWay Pin — grand, au centre ── */}
      {/* Halo */}
      <ellipse cx="210" cy="82" rx="60" ry="60" fill="url(#pinGlow)" />

      {/* Pin corps */}
      <g transform="translate(210, 97)" filter="url(#pinShadow)">
        <path
          d="M 0,46 C -5,36 -36,22 -36,-10 A 36,36 0 1,1 36,-10 C 36,22 5,36 0,46 Z"
          fill="#E8644A"
          stroke="white"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* Reflet */}
        <path
          d="M -16,-24 Q -8,-36 4,-30"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Point blanc central */}
        <circle cx="0" cy="-10" r="14" fill="white" />
        {/* K initial */}
        <text x="0" y="-5" textAnchor="middle" fontFamily="'Segoe UI', system-ui, sans-serif" fontWeight="900" fontSize="14" fill="#E8644A">K</text>
      </g>
    </svg>
  );
}

export default function PersonalizationSection() {
  return (
    <section style={{
      background: "linear-gradient(135deg, #0D1628 0%, #1A2440 60%, #0F1E38 100%)",
      padding: "100px clamp(24px, 6vw, 80px)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Particules lumineuses décoratives */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {[[10, 15], [85, 25], [60, 70], [20, 80], [75, 55]].map(([x, y], i) => (
          <div key={i} style={{
            position: "absolute", left: `${x}%`, top: `${y}%`,
            width: i % 2 === 0 ? "3px" : "5px",
            height: i % 2 === 0 ? "3px" : "5px",
            borderRadius: "50%",
            background: i % 3 === 0 ? "#E8644A" : i % 3 === 1 ? "#6FA8C0" : "#06D6A0",
            opacity: 0.35,
            filter: "blur(1px)",
          }} />
        ))}
      </div>

      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        display: "flex", alignItems: "center",
        gap: "clamp(40px, 6vw, 80px)",
        flexWrap: "wrap",
      }}>

        {/* ── Visual — panneau directionnel ── */}
        <div style={{
          flex: "0 0 auto",
          width: "clamp(260px, 38%, 420px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <SignpostIllustration />
        </div>

        {/* ── Contenu texte ── */}
        <div style={{ flex: 1, minWidth: "280px" }}>

          <h2 style={{
            fontFamily: "var(--font-nunito, 'Nunito'), sans-serif",
            fontWeight: 900,
            fontSize: "clamp(28px, 3.5vw, 46px)",
            color: "#FFFFFF",
            lineHeight: 1.1,
            marginBottom: "18px",
            letterSpacing: "-0.02em",
          }}>
            Votre recherche,{" "}
            <span style={{
              background: "linear-gradient(90deg, #E8644A, #F09070)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              à votre image
            </span>
          </h2>

          <p style={{
            fontSize: "clamp(15px, 1.5vw, 18px)",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.7,
            marginBottom: "36px",
            maxWidth: "480px",
          }}>
            Chaque voyageur est différent. Filtrez les hôtels selon vos critères exacts : budget, bornes de recharge, heure d'arrivée, détour acceptable. Vous ne verrez que ce qui vous correspond vraiment.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: "💶", label: "Fourchette de prix", detail: "Affichez uniquement les hôtels dans votre budget", color: "#E8644A" },
              { icon: "⚡", label: "Borne de recharge EV", detail: "Filtrez les établissements équipés pour voitures électriques", color: "#06D6A0" },
              { icon: "🕐", label: "Heure de check-in", detail: "Masquez les hôtels que vous ne pourrez pas atteindre à temps", color: "#6FA8C0" },
              { icon: "↗", label: "Détour minimal", detail: "Uniquement les hôtels à moins de X minutes de votre route", color: "#FFD166" },
              { icon: "★", label: "Note minimale", detail: "Ne gardez que les établissements bien notés", color: "#A78BFA" },
            ].map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                transition: "background 0.15s",
              }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: `${f.color}22`,
                  border: `1px solid ${f.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-nunito, 'Nunito'), sans-serif", fontWeight: 700, fontSize: "14px", color: "#FFFFFF", marginBottom: "2px" }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>
                    {f.detail}
                  </div>
                </div>
                <div style={{
                  marginLeft: "auto", flexShrink: 0,
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: f.color, opacity: 0.7,
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
