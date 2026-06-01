"use client";

const STEPS = [
  {
    number: "01", icon: "📍", color: "#E8644A",
    title: "Entrez votre itinéraire",
    desc: "Départ et destination : une rue, une ville, un village.",
  },
  {
    number: "02", icon: "🗺️", color: "#6FA8C0",
    title: "La route s'affiche",
    desc: "Tous les hôtels disponibles sur le chemin apparaissent.",
  },
  {
    number: "03", icon: "🎛️", color: "#E8644A",
    title: "Filtrez et affinez",
    desc: "Prix, note, borne EV, détour maximal.",
  },
  {
    number: "04", icon: "🏨", color: "#6FA8C0",
    title: "Choisissez et réservez",
    desc: "Réservez en un clic via la plateforme de votre choix.",
  },
];

// Pins — large oscillation gauche / droite
const PINS = [
  { x: 200, y: 110 },
  { x: 560, y: 530 },
  { x: 240, y: 970 },
  { x: 580, y: 1370 },
];
const cardAligns: ("left" | "right")[] = ["right", "left", "right", "left"];

// Loopings réels : chaque segment Bézier a ses points de contrôle
// alternativement à x=920 (hors droite) et x=-220 (hors gauche).
// La route sort du viewport, boucle dans l'invisible et RE-CROISE son propre tracé
// en revenant — le crossing visible dans le viewport crée l'effet looping.
const ROAD_PATH = `
  M 200,110
  C 920,160 -220,460 560,530
  C -220,600 920,890 240,970
  C 920,1040 -220,1290 580,1370
  C 560,1440 540,1460 525,1490
`;

// Hôtels positionnés à l'intérieur des boucles / aux croisements visibles
const HOTELS = [
  { x: 720, y: 250,  badge: "★ Top noté",        sub: "≥ 4,5 / 5",              color: "#FFD166", side: "left"  as const },
  { x: 80,  y: 410,  badge: "⚡ Borne EV",        sub: "Rechargez en dormant",    color: "#06D6A0", side: "right" as const },
  { x: 720, y: 720,  badge: "💶 Budget maîtrisé", sub: "< 60 € / 100 € / 150 €", color: "#E8644A", side: "left"  as const },
  { x: 80,  y: 1060, badge: "↗ Sans détour",      sub: "≤ 5 min de votre route",  color: "#6FA8C0", side: "right" as const },
  { x: 720, y: 1220, badge: "🌙 Accueil 24h",     sub: "Arrivée à toute heure",   color: "#A78BFA", side: "left"  as const },
];

// ── Bâtiment hôtel ───────────────────────────────────────────────
function HotelBuilding({ x, y, badge, sub, color, side }: typeof HOTELS[0]) {
  const bw = 136;
  // Badge toujours vers le centre (left hotel → badge right, right hotel → badge left)
  const bx = side === "right" ? 46 : -46 - bw;
  const lineX1 = side === "right" ? 20 : -20;
  const lineX2 = side === "right" ? 46 : -46;

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Ombre bâtiment */}
      <ellipse cx="2" cy="14" rx="22" ry="5" fill="rgba(0,0,0,0.08)" />
      {/* Corps */}
      <rect x="-20" y="-50" width="40" height="64" fill="#EDE8DF" rx="3" />
      {/* Bandeau couleur en toit */}
      <rect x="-20" y="-50" width="40" height="6" fill={color} rx="2" />
      {/* Fenêtres 3 étages × 2 colonnes */}
      {[0, 1, 2].flatMap(row =>
        [-11, 3].map(col => (
          <rect key={`w${row}${col}`} x={col} y={-40 + row * 14} width="8" height="8" fill="#AED6F1" rx="1" opacity="0.9" />
        ))
      )}
      {/* Porte */}
      <rect x="-5" y="-2" width="10" height="16" fill="#9B7B5A" rx="1" />
      {/* Connecteur pointillé */}
      <line x1={lineX1} y1="-24" x2={lineX2} y2="-24"
        stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeDasharray="3,3" />
      {/* Badge */}
      <g transform={`translate(${bx},-38)`}>
        <rect x="0" y="0" width={bw} height="34" rx="9"
          fill={color}
          style={{ filter: `drop-shadow(0 3px 8px ${color}44)` }}
        />
        <text x={bw / 2} y="12" textAnchor="middle"
          fontFamily="'Segoe UI', system-ui, sans-serif"
          fontWeight="800" fontSize="11" fill="white"
        >{badge}</text>
        <text x={bw / 2} y="26" textAnchor="middle"
          fontFamily="'Segoe UI', system-ui, sans-serif"
          fontSize="9" fill="rgba(255,255,255,0.82)"
        >{sub}</text>
      </g>
    </g>
  );
}

// ── Pin étape ────────────────────────────────────────────────────
function MapPin({ x, y, color, icon }: { x: number; y: number; color: string; icon: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="0" cy="-10" r="38" fill={color} opacity="0.14" />
      <path d="M 0,42 C -5,32 -32,20 -32,-8 A 32,32 0 1,1 32,-8 C 32,20 5,32 0,42 Z"
        fill={color} stroke="white" strokeWidth="4" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 4px 10px ${color}55)` }} />
      <circle cx="0" cy="-8" r="21" fill="white" />
      <text x="0" y="2" textAnchor="middle" fontSize="16" dominantBaseline="middle">{icon}</text>
    </g>
  );
}

// ── Card étape — SVG natif (pas de foreignObject) ────────────────
function StepCard({ step, x, y, align }: { step: typeof STEPS[0]; x: number; y: number; align: "left" | "right" }) {
  const w = 190;
  const h = 88;
  const cx = align === "right" ? x + 46 : x - 46 - w;
  const cy = y - h / 2;
  // Découpe la description en 2 lignes max
  const words = step.desc.split(" ");
  let line1 = "", line2 = "";
  for (const word of words) {
    if ((line1 + " " + word).trim().length <= 32) line1 = (line1 + " " + word).trim();
    else line2 = (line2 + " " + word).trim();
  }

  return (
    <g>
      {/* Connecteur */}
      <line
        x1={align === "right" ? x + 32 : x - 32} y1={y}
        x2={align === "right" ? x + 46 : x - 46} y2={y}
        stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="3,3"
      />
      {/* Fond card */}
      <rect x={cx} y={cy} width={w} height={h} rx="14" ry="14"
        fill="rgba(255,255,255,0.92)"
        style={{ filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.09))" }}
      />
      {/* Numéro */}
      <text x={cx + 14} y={cy + 28}
        fontFamily="'Nunito', sans-serif" fontWeight="900" fontSize="22"
        fill={step.color} opacity="0.22"
      >{step.number}</text>
      {/* Titre */}
      <text x={cx + 44} y={cy + 26}
        fontFamily="'Nunito', sans-serif" fontWeight="800" fontSize="12.5"
        fill="#1E1E2E"
      >{step.title}</text>
      {/* Description ligne 1 */}
      <text x={cx + 14} y={cy + 48}
        fontFamily="'Segoe UI', system-ui, sans-serif" fontSize="10.5"
        fill="#6B7280"
      >{line1}</text>
      {/* Description ligne 2 */}
      {line2 && (
        <text x={cx + 14} y={cy + 63}
          fontFamily="'Segoe UI', system-ui, sans-serif" fontSize="10.5"
          fill="#6B7280"
        >{line2}</text>
      )}
    </g>
  );
}

// ── Décors ───────────────────────────────────────────────────────
function PineTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <polygon points="0,-36 -14,0 14,0" fill="#5A8A5E" />
      <polygon points="0,-22 -18,10 18,10" fill="#4A7A4E" />
      <polygon points="0,-8 -21,20 21,20" fill="#3D6B41" />
      <rect x="-3.5" y="20" width="7" height="11" rx="1.5" fill="#7B5533" />
    </g>
  );
}
function RoundTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x="-3" y="0" width="6" height="14" rx="1" fill="#8B6914" />
      <circle cx="0" cy="-11" r="18" fill="#5A9A3A" />
      <circle cx="-6" cy="-16" r="11" fill="#6AAA4A" />
    </g>
  );
}
function Cloud({ x, y, s = 1, op = 0.85 }: { x: number; y: number; s?: number; op?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={op}>
      <ellipse cx="0" cy="0" rx="32" ry="18" fill="white" />
      <ellipse cx="-20" cy="3" rx="18" ry="13" fill="white" />
      <ellipse cx="20" cy="3" rx="18" ry="13" fill="white" />
      <ellipse cx="0" cy="-10" rx="20" ry="15" fill="white" />
    </g>
  );
}
function Birds({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={0.38}>
      <path d="M 0,0 Q 5,-4 10,0" fill="none" stroke="#4A6FA0" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 13,3 Q 18,-1 23,3" fill="none" stroke="#4A6FA0" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 5,9 Q 10,5 15,9" fill="none" stroke="#4A6FA0" strokeWidth="1.3" strokeLinecap="round" />
    </g>
  );
}

export default function TutorialRoute() {
  return (
    <section style={{ background: "#D6EEFF", padding: "80px 0 0", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: "40px", padding: "0 24px" }}>
        <h2 style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontWeight: 800, fontSize: "clamp(28px, 3vw, 40px)",
          color: "#1E1E2E", marginBottom: "12px",
        }}>
          Simple comme bonjour
        </h2>
        <p style={{ fontSize: "16px", color: "#6B7280", maxWidth: "400px", margin: "0 auto" }}>
          Suivez la route. Chaque étape est une action.
        </p>
      </div>

      <div style={{ width: "100%", overflow: "hidden" }}>
        <svg
          viewBox="0 0 800 1540"
          style={{ width: "100%", height: "auto", display: "block" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D6EEFF" />
              <stop offset="58%" stopColor="#FFE0C8" />
              <stop offset="100%" stopColor="#FFD4A8" />
            </linearGradient>
          </defs>

          {/* Fond */}
          <rect x="0" y="0" width="800" height="1540" fill="url(#skyGrad)" />

          {/* ── Nuages & oiseaux (fond) ── */}
          <Cloud x={130} y={52}  s={1.05} op={0.88} />
          <Cloud x={620} y={36}  s={0.82} op={0.72} />
          <Cloud x={440} y={76}  s={0.6}  op={0.5}  />
          <Cloud x={68}  y={440} s={0.7}  op={0.42} />
          <Cloud x={706} y={500} s={0.85} op={0.48} />
          <Cloud x={360} y={250} s={0.52} op={0.32} />
          <Cloud x={150} y={820} s={0.65} op={0.35} />
          <Cloud x={680} y={940} s={0.72} op={0.38} />
          <Birds x={510} y={125} s={1.0} />
          <Birds x={125} y={290} s={0.85} />
          <Birds x={650} y={660} s={0.9} />
          <Birds x={100} y={1050} s={0.8} />

          {/* ── Arbres — à l'intérieur des boucles et aux bords ── */}
          <PineTree  x={340} y={200} s={0.9}  />
          <RoundTree x={380} y={255} s={0.75} />
          <PineTree  x={310} y={310} s={0.8}  />
          <PineTree  x={420} y={360} s={0.72} />

          <PineTree  x={340} y={660} s={0.88} />
          <RoundTree x={380} y={720} s={0.78} />
          <PineTree  x={310} y={780} s={0.82} />

          <PineTree  x={360} y={1100} s={0.85} />
          <RoundTree x={400} y={1155} s={0.72} />
          <PineTree  x={330} y={1210} s={0.8}  />
          <PineTree  x={420} y={1260} s={0.7}  />

          {/* ── Route : ombre ── */}
          <path d={ROAD_PATH} fill="none"
            stroke="rgba(160,50,20,0.16)" strokeWidth="34"
            strokeLinecap="round" strokeLinejoin="round"
            transform="translate(2,5)" />

          {/* ── Route : corps (plus fine) ── */}
          <path d={ROAD_PATH} fill="none"
            stroke="#E8644A" strokeWidth="28"
            strokeLinecap="round" strokeLinejoin="round" />

          {/* ── Route : tirets blancs ── */}
          <path d={ROAD_PATH} fill="none"
            stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeDasharray="20,15" opacity="0.82" />

          {/* ── Hôtels avec badges (dessinés APRÈS la route = au-dessus) ── */}
          {HOTELS.map((h, i) => <HotelBuilding key={i} {...h} />)}

          {/* ── Cards étapes (au-dessus de tout) ── */}
          {PINS.map((pin, i) => (
            <StepCard key={i} step={STEPS[i]} x={pin.x} y={pin.y} align={cardAligns[i]} />
          ))}

          {/* ── Pins (tout en haut) ── */}
          {PINS.map((pin, i) => (
            <MapPin key={i} x={pin.x} y={pin.y} color={STEPS[i].color} icon={STEPS[i].icon} />
          ))}
        </svg>
      </div>
    </section>
  );
}
