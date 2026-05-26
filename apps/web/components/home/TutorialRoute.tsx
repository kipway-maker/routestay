"use client";

const STEPS = [
  {
    number: "01",
    emoji: "📍",
    color: "#FF6240",
    border: "#FF6240",
    bg: "rgba(255,98,64,0.08)",
    title: "Entrez votre itinéraire",
    desc: "Départ et destination — une rue, une ville, un village. L'autocomplete trouve tout.",
  },
  {
    number: "02",
    emoji: "🗺️",
    color: "#00B4D8",
    border: "#00B4D8",
    bg: "rgba(0,180,216,0.08)",
    title: "La route s'affiche",
    desc: "Votre itinéraire est calculé et tracé sur la carte. Tous les hôtels sur le chemin apparaissent.",
  },
  {
    number: "03",
    emoji: "🎯",
    color: "#06D6A0",
    border: "#06D6A0",
    bg: "rgba(6,214,160,0.08)",
    title: "Focus & Filtres",
    desc: "Ajoutez un Focus Point pour zoomer sur une ville d'étape. Filtrez par prix, note ou détour.",
  },
  {
    number: "04",
    emoji: "🏨",
    color: "#FFD166",
    border: "#F4B942",
    bg: "rgba(255,209,102,0.12)",
    title: "Choisissez et réservez",
    desc: "Cliquez sur un hôtel : photo, prix, km de détour. Réservez en un clic via la plateforme de votre choix.",
  },
];

// Positions des pins dans le viewBox 800×2000
const PINS = [
  { x: 180, y: 120 },
  { x: 580, y: 660 },
  { x: 200, y: 1200 },
  { x: 560, y: 1740 },
];

// Chemin SVG — serpente de gauche à droite avec 2 vraies boucles
const PATH = `
  M 180,120
  C 60,220 720,320 720,440
  C 720,510 650,440 630,500
  C 610,560 640,620 580,660
  C 500,720 60,790 40,920
  C 20,1050 170,970 185,1060
  C 195,1130 200,1170 200,1200
  C 100,1310 740,1400 740,1520
  C 740,1590 660,1530 645,1600
  C 630,1660 595,1710 560,1740
`;

function MapPin({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x},${y})`} style={{ filter: `drop-shadow(0 4px 8px ${color}55)` }}>
      <path
        d="M 0,30 C -3,23 -22,14 -22,-6 A 22,22 0 1,1 22,-6 C 22,14 3,23 0,30 Z"
        fill={color}
        stroke="white"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <circle cx="0" cy="-6" r="9" fill="white" />
    </g>
  );
}

// Card HTML en foreignObject SVG
function StepCard({ step, x, y, align }: {
  step: typeof STEPS[0];
  x: number;
  y: number;
  align: "left" | "right";
}) {
  const w = 290;
  const h = 160;
  const cx = align === "right" ? x + 40 : x - 40 - w;

  return (
    <foreignObject x={cx} y={y - h / 2} width={w} height={h + 20}>
      <div
        // @ts-expect-error xmlns needed for foreignObject
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          background: "#FFFFFF",
          borderRadius: "18px",
          padding: "18px 20px",
          boxShadow: "0 6px 28px rgba(0,0,0,0.1)",
          border: `2px solid ${step.bg.replace("0.08", "0.3").replace("0.12","0.3")}`,
          height: `${h}px`,
          boxSizing: "border-box" as const,
          display: "flex",
          flexDirection: "column" as const,
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "12px",
            background: step.bg, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "20px", flexShrink: 0,
          }}>
            {step.emoji}
          </div>
          <span style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900, fontSize: "30px",
            color: step.color, opacity: 0.2, lineHeight: "1",
          }}>
            {step.number}
          </span>
        </div>
        <div style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800, fontSize: "15px",
          color: "#1A1A2E", marginBottom: "5px",
        }}>
          {step.title}
        </div>
        <div style={{
          fontSize: "12.5px", color: "#6B7280", lineHeight: "1.5",
        }}>
          {step.desc}
        </div>
      </div>
    </foreignObject>
  );
}

// Petit connecteur trait entre pin et card
function Connector({ pinX, pinY, cardAlign }: { pinX: number; pinY: number; cardAlign: "left" | "right" }) {
  const endX = cardAlign === "right" ? pinX + 40 : pinX - 40;
  return (
    <line
      x1={cardAlign === "right" ? pinX + 22 : pinX - 22}
      y1={pinY}
      x2={endX}
      y2={pinY}
      stroke="#e5e7eb"
      strokeWidth="2"
      strokeDasharray="4,3"
    />
  );
}

export default function TutorialRoute() {
  const cardAligns: ("left" | "right")[] = ["right", "left", "right", "left"];

  return (
    <section style={{
      background: "linear-gradient(180deg, #F8F7F4 0%, #F0F9FF 50%, #F0FFF8 100%)",
      padding: "80px 0 60px",
    }}>
      <div style={{ textAlign: "center", marginBottom: "40px", padding: "0 24px" }}>
        <h2 style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontWeight: 800, fontSize: "clamp(28px, 3vw, 40px)",
          color: "#1A1A2E", marginBottom: "12px",
        }}>
          Simple comme bonjour
        </h2>
        <p style={{ fontSize: "16px", color: "#6B7280", maxWidth: "400px", margin: "0 auto" }}>
          Suivez la route — chaque étape est une action.
        </p>
      </div>

      {/* SVG scrollable — full width, tall */}
      <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto", overflow: "visible" }}>
        <svg
          viewBox="0 0 800 2000"
          style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Texture organique */}
            <filter id="roughen" x="-2%" y="-2%" width="104%" height="104%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="8" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="5"
                xChannelSelector="R" yChannelSelector="G" />
            </filter>

            {/* Pattern texture tressée */}
            <pattern id="weave" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
              <rect width="16" height="16" fill="transparent" />
              <line x1="0" y1="4" x2="16" y2="4" stroke="rgba(255,255,255,0.18)" strokeWidth="3.5" />
              <line x1="0" y1="12" x2="16" y2="12" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
            </pattern>

            <clipPath id="pathClip">
              <path d={PATH} strokeWidth="40" stroke="white" fill="none" strokeLinecap="round" />
            </clipPath>
          </defs>

          {/* ── Route — 4 couches ── */}

          {/* Couche 1 : ombre portée */}
          <path
            d={PATH} fill="none"
            stroke="rgba(180,60,30,0.25)"
            strokeWidth="46"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#roughen)"
            transform="translate(3,5)"
          />

          {/* Couche 2 : corps principal brand orange */}
          <path
            d={PATH} fill="none"
            stroke="#FF6240"
            strokeWidth="38"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#roughen)"
          />

          {/* Couche 3 : texture tressée clippée sur le chemin */}
          <rect
            x="0" y="0" width="800" height="2000"
            fill="url(#weave)"
            clipPath="url(#pathClip)"
            filter="url(#roughen)"
          />

          {/* Couche 4 : reflet highlight (côté gauche du trait) */}
          <path
            d={PATH} fill="none"
            stroke="rgba(255,180,150,0.45)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="30,60"
            filter="url(#roughen)"
          />

          {/* Couche 5 : liseret brillant central */}
          <path
            d={PATH} fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ── Connecteurs pin → card ── */}
          {PINS.map((pin, i) => (
            <Connector key={i} pinX={pin.x} pinY={pin.y} cardAlign={cardAligns[i]} />
          ))}

          {/* ── Pins ── */}
          {PINS.map((pin, i) => (
            <MapPin key={i} x={pin.x} y={pin.y} color={STEPS[i].color} />
          ))}

          {/* ── Cards ── */}
          {PINS.map((pin, i) => (
            <StepCard
              key={i}
              step={STEPS[i]}
              x={pin.x}
              y={pin.y}
              align={cardAligns[i]}
            />
          ))}
        </svg>
      </div>
    </section>
  );
}
