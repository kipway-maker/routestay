"use client";

import { useEffect, useState } from "react";

// ── Bezier solver (ROAD_PATH original) ────────────────────────
function bezierPt(t: number) {
  const mt = 1 - t;
  return {
    x: mt*mt*mt*250 + 3*mt*mt*t*600 + 3*mt*t*t*680 + t*t*t*680,
    y: mt*mt*mt*90  + 3*mt*mt*t*90  + 3*mt*t*t*310 + t*t*t*520,
  };
}
function bezierTangent(t: number) {
  const mt = 1 - t;
  const tx = 3*(mt*mt*(600-250) + 2*mt*t*(680-600) + t*t*(680-680));
  const ty = 3*(mt*mt*(90-90)   + 2*mt*t*(310-90)  + t*t*(520-310));
  const len = Math.sqrt(tx*tx + ty*ty);
  return { tx: tx/len, ty: ty/len };
}
function findTforY(targetY: number) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    bezierPt(mid).y < targetY ? (lo = mid) : (hi = mid);
  }
  return (lo + hi) / 2;
}
function roadCrackPolygon(yTop: number, yBot: number): string {
  const hw = 24;
  const tTop = findTforY(yTop), tBot = findTforY(yBot), tMid = (tTop+tBot)/2;
  const { x: cx, y: cy } = bezierPt(tMid);
  const { tx, ty } = bezierTangent(tMid);
  const pTop = bezierPt(tTop), pBot = bezierPt(tBot);
  const cutLen = Math.hypot(pBot.x-pTop.x, pBot.y-pTop.y);
  const hc = cutLen/2;
  function s(u: number, v: number) {
    return `${(cx + u*tx + v*ty).toFixed(1)},${(cy + u*ty - v*tx).toFixed(1)}`;
  }
  const topBreak = [
    s(-hc+1,-hw), s(-hc-5,-hw*.75), s(-hc+3,-hw*.5),
    s(-hc-10,-hw*.2), s(-hc+4,hw*.1), s(-hc-7,hw*.35),
    s(-hc+9,hw*.6), s(-hc-3,hw*.82), s(-hc+5,hw),
  ];
  const botBreak = [
    s(hc+2,hw), s(hc-6,hw*.78), s(hc+8,hw*.52),
    s(hc-4,hw*.22), s(hc+11,-hw*.1), s(hc-5,-hw*.38),
    s(hc+7,-hw*.62), s(hc-9,-hw*.82), s(hc+3,-hw),
  ];
  return [...topBreak, s(hc,hw), ...botBreak, s(-hc,-hw)].join(" ");
}

// ── Icônes Phosphor fill (viewBox 256×256) ────────────────────
const T = "scale(0.117) translate(-128,-128)";
type IconName = "itinerary"|"filter"|"map"|"car";
function PinIcon({ name, color }: { name: IconName; color: string }) {
  switch (name) {
    case "itinerary": return <path transform={T} fill={color} d="M228,200a28,28,0,0,1-54.83,8H72a48,48,0,0,1,0-96h96a24,24,0,0,0,0-48H72a8,8,0,0,1,0-16h96a40,40,0,0,1,0,80H72a32,32,0,0,0,0,64H173.17A28,28,0,0,1,228,200Z"/>;
    case "filter":    return <path transform={T} fill={color} d="M84,136a28,28,0,0,1-20,26.83V216a8,8,0,0,1-16,0V162.83a28,28,0,0,1,0-53.66V40a8,8,0,0,1,16,0v69.17A28,28,0,0,1,84,136Zm52-74.83V40a8,8,0,0,0-16,0V61.17a28,28,0,0,0,0,53.66V216a8,8,0,0,0,16,0V114.83a28,28,0,0,0,0-53.66Zm72,80V40a8,8,0,0,0-16,0V141.17a28,28,0,0,0,0,53.66V216a8,8,0,0,0,16,0V194.83a28,28,0,0,0,0-53.66Z"/>;
    case "map":       return <path transform={T} fill={color} d="M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.52,99.58,32.84a8,8,0,0,0-5.52-.6l-64,16A8,8,0,0,0,24,56V200a8,8,0,0,0,9.94,7.76l61.13-15.28,61.35,30.68A8.15,8.15,0,0,0,160,224a8,8,0,0,0,1.94-.24l64-16A8,8,0,0,0,232,200V56A8,8,0,0,0,228.92,49.69ZM96,176a8,8,0,0,0-1.94.24L40,189.75V62.25L95.07,48.48l.93.46Zm120,17.75-55.07,13.77-.93-.46V80a8,8,0,0,0,1.94-.23L216,66.25Z"/>;
    case "car":       return <path transform={T} fill={color} d="M240,104H229.2L201.42,41.5A16,16,0,0,0,186.8,32H69.2a16,16,0,0,0-14.62,9.5L26.8,104H16a8,8,0,0,0,0,16h8v80a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16v-8h96v8a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V120h8a8,8,0,0,0,0-16ZM80,152H56a8,8,0,0,1,0-16H80a8,8,0,0,1,0,16Zm120,0H176a8,8,0,0,1,0-16h24a8,8,0,0,1,0,16ZM44.31,104,69.2,48H186.8l24.89,56Z"/>;
  }
}

// ── Data ──────────────────────────────────────────────────────
const STEPS = [
  { number:"01", icon:"itinerary" as const, color:"#E8644A", title:"Entrez votre itinéraire",    desc:"Départ + arrivée. Votre route calculée en quelques secondes." },
  { number:"02", icon:"filter"    as const, color:"#6FA8C0", title:"Personnalisez la recherche", desc:"Budget, borne EV, note, détour. Filtrez jusqu'au bon hôtel." },
  { number:"03", icon:"map"       as const, color:"#E8644A", title:"Cherchez sur l'itinéraire",  desc:"Cliquez sur votre route pour voir les hôtels à cette étape." },
  { number:"04", icon:"car"       as const, color:"#6FA8C0", title:"Partez en voyage",           desc:"Réservez en un clic. La route vous attend." },
];

const PINS = [
  { x:250, y:90   },
  { x:680, y:520  },
  { x:120, y:980  },
  { x:680, y:1400 },
];
const cardAligns: ("left"|"right")[] = ["right","left","right","left"];

const ROAD_PATH = `
  M 250,90
  C 600,90 680,310 680,520
  C 680,640 420,720 140,700
  C 30,695 120,840 120,980
  C 120,1120 400,1200 660,1180
  C 700,1178 680,1310 680,1400
`;

const HOTELS = [
  { x:700, y:290,  color:"#FFD166" },
  { x:80,  y:620,  color:"#06D6A0" },
  { x:700, y:840,  color:"#E8644A" },
  { x:80,  y:1090, color:"#6FA8C0" },
  { x:700, y:1290, color:"#A78BFA" },
];

// ── Composants SVG ────────────────────────────────────────────
function PineTree({ x, y, s=1 }: { x:number; y:number; s?:number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <polygon points="0,-36 -14,0 14,0"   fill="#5A8A5E"/>
      <polygon points="0,-22 -18,10 18,10" fill="#4A7A4E"/>
      <polygon points="0,-8 -21,20 21,20"  fill="#3D6B41"/>
      <rect x="-3.5" y="20" width="7" height="11" rx="1.5" fill="#7B5533"/>
    </g>
  );
}
function RoundTree({ x, y, s=1 }: { x:number; y:number; s?:number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x="-3" y="0" width="6" height="14" rx="1" fill="#8B6914"/>
      <circle cx="0" cy="-11" r="18" fill="#5A9A3A"/>
      <circle cx="-6" cy="-16" r="11" fill="#6AAA4A"/>
    </g>
  );
}
function Cloud({ x, y, s=1, op=0.85 }: { x:number; y:number; s?:number; op?:number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={op}>
      <ellipse cx="0"   cy="0"   rx="32" ry="18" fill="white"/>
      <ellipse cx="-20" cy="3"   rx="18" ry="13" fill="white"/>
      <ellipse cx="20"  cy="3"   rx="18" ry="13" fill="white"/>
      <ellipse cx="0"   cy="-10" rx="20" ry="15" fill="white"/>
    </g>
  );
}
function Birds({ x, y, s=1 }: { x:number; y:number; s?:number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity="0.38">
      <path d="M 0,0 Q 5,-4 10,0"  fill="none" stroke="#4A6FA0" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M 13,3 Q 18,-1 23,3" fill="none" stroke="#4A6FA0" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M 5,9 Q 10,5 15,9"  fill="none" stroke="#4A6FA0" strokeWidth="1.3" strokeLinecap="round"/>
    </g>
  );
}
function HotelBuilding({ x, y, color }: { x:number; y:number; color:string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="2" cy="14" rx="22" ry="5" fill="rgba(0,0,0,0.08)"/>
      <rect x="-20" y="-50" width="40" height="64" fill="#EDE8DF" rx="3"/>
      <rect x="-20" y="-50" width="40" height="6" fill={color} rx="2"/>
      {[0,1,2].flatMap(row => [-11,3].map(col => (
        <rect key={`${row}${col}`} x={col} y={-40+row*14} width="8" height="8" fill="#AED6F1" rx="1" opacity="0.9"/>
      )))}
      <rect x="-5" y="-2" width="10" height="16" fill="#9B7B5A" rx="1"/>
    </g>
  );
}
function MapPin({ x, y, color, icon }: { x:number; y:number; color:string; icon:string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="0" cy="-10" r="38" fill={color} opacity="0.14"/>
      <path d="M 0,42 C -5,32 -32,20 -32,-8 A 32,32 0 1,1 32,-8 C 32,20 5,32 0,42 Z"
        fill={color} stroke="white" strokeWidth="4" strokeLinejoin="round"
        style={{ filter:`drop-shadow(0 4px 10px ${color}55)` }}/>
      <circle cx="0" cy="-8" r="21" fill="white"/>
      <g transform="translate(0,-8)">
        <PinIcon name={icon as IconName} color={color}/>
      </g>
    </g>
  );
}
function StepCard({ step, x, y, align }: { step:typeof STEPS[0]; x:number; y:number; align:"left"|"right" }) {
  const w=178, h=64, cx=align==="right"?x+46:x-46-w, cy=y-h/2;
  const words = step.desc.split(" ");
  let line1="", line2="";
  for (const word of words) {
    if ((line1+" "+word).trim().length<=38) line1=(line1+" "+word).trim();
    else line2=(line2+" "+word).trim();
  }
  return (
    <g>
      <line x1={align==="right"?x+32:x-32} y1={y} x2={align==="right"?x+46:x-46} y2={y}
        stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="3,3"/>
      <rect x={cx} y={cy} width={w} height={h} rx="12" fill="rgba(255,255,255,0.93)"
        style={{ filter:"drop-shadow(0 3px 10px rgba(0,0,0,0.08))" }}/>
      <rect x={cx+8} y={cy+8} width={20} height={12} rx="5" fill={step.color} opacity="0.15"/>
      <text x={cx+18} y={cy+17} textAnchor="middle" fontFamily="'Nunito',sans-serif" fontWeight="900" fontSize="6.5" fill={step.color}>{step.number}</text>
      <text x={cx+34} y={cy+18} fontFamily="'Nunito',sans-serif" fontWeight="800" fontSize="8" fill="#1E1E2E">{step.title}</text>
      <line x1={cx+8} y1={cy+25} x2={cx+w-8} y2={cy+25} stroke="rgba(0,0,0,0.06)" strokeWidth="0.8"/>
      <text x={cx+8} y={cy+37} fontFamily="system-ui,sans-serif" fontSize="6.5" fill="#6B7280">{line1}</text>
      {line2 && <text x={cx+8} y={cy+48} fontFamily="system-ui,sans-serif" fontSize="6.5" fill="#6B7280">{line2}</text>}
    </g>
  );
}

// ── Composant principal ───────────────────────────────────────
export default function TutorialRoute({ hideHeader=false, hideStepCards=false }: { hideHeader?:boolean; hideStepCards?:boolean }) {
  const [maskPoly, setMaskPoly] = useState<string>("");

  useEffect(() => {
    function update() {
      const W = window.innerWidth;
      const svgScale = 800/W;
      const titleYsvg = 90 + 220*svgScale;
      const h1px = Math.min(64, Math.max(34, 0.045*W));
      const h1svg = h1px * svgScale;
      setMaskPoly(roadCrackPolygon(titleYsvg-2, titleYsvg+h1svg+2));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section style={{ background:"#D6EEFF", padding:hideHeader?"0":"80px 0 0", overflow:"hidden" }}>
      {!hideHeader && (
        <div style={{ textAlign:"center", marginBottom:"40px", padding:"0 24px" }}>
          <h2 style={{ fontFamily:"var(--font-nunito),sans-serif", fontWeight:800, fontSize:"clamp(28px,3vw,40px)", color:"#1E1E2E", marginBottom:"12px" }}>
            Simple comme bonjour
          </h2>
          <p style={{ fontSize:"16px", color:"#6B7280", maxWidth:"400px", margin:"0 auto" }}>
            Suivez la route. Chaque étape est une action.
          </p>
        </div>
      )}
      <div style={{ width:"100%", overflow:"hidden" }}>
        <svg viewBox="0 0 800 1540" style={{ width:"100%", height:"auto", display:"block" }} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#D6EEFF"/>
              <stop offset="58%"  stopColor="#FFE0C8"/>
              <stop offset="100%" stopColor="#FFD4A8"/>
            </linearGradient>
            <filter id="crackEdge" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2"/>
            </filter>
            {maskPoly && (
              <mask id="titleMask">
                <rect x="0" y="0" width="800" height="1540" fill="white"/>
                <polygon points={maskPoly} fill="black" filter="url(#crackEdge)"/>
              </mask>
            )}
          </defs>

          {/* Fond */}
          <rect x="0" y="0" width="800" height="1540" fill="url(#skyGrad)"/>

          {/* Nuages */}
          <Cloud x={130} y={52}  s={1.05} op={0.88}/>
          <Cloud x={620} y={36}  s={0.82} op={0.72}/>
          <Cloud x={440} y={76}  s={0.6}  op={0.5}/>
          <Cloud x={68}  y={440} s={0.7}  op={0.42}/>
          <Cloud x={706} y={500} s={0.85} op={0.48}/>
          <Cloud x={360} y={250} s={0.52} op={0.32}/>
          <Cloud x={150} y={820} s={0.65} op={0.35}/>
          <Cloud x={680} y={940} s={0.72} op={0.38}/>

          {/* Oiseaux */}
          <Birds x={510} y={125} s={1.0}/>
          <Birds x={125} y={290} s={0.85}/>
          <Birds x={650} y={660} s={0.9}/>
          <Birds x={100} y={1050} s={0.8}/>

          {/* Arbres */}
          <PineTree  x={750} y={380} s={0.88}/>
          <RoundTree x={738} y={470} s={0.80}/>
          <RoundTree x={28}  y={730} s={0.84}/>
          <PineTree  x={14}  y={840} s={0.78}/>
          <RoundTree x={30}  y={960} s={0.80}/>
          <PineTree  x={14}  y={1060} s={0.76}/>
          <PineTree  x={750} y={1200} s={0.82}/>
          <RoundTree x={738} y={1300} s={0.74}/>

          {/* Route */}
          <g mask={maskPoly ? "url(#titleMask)" : undefined}>
            <path d={ROAD_PATH} fill="none" stroke="rgba(160,50,20,0.16)" strokeWidth="34"
              strokeLinecap="round" strokeLinejoin="round" transform="translate(2,5)"/>
            <path d={ROAD_PATH} fill="none" stroke="#E8644A" strokeWidth="28"
              strokeLinecap="round" strokeLinejoin="round"/>
            <path d={ROAD_PATH} fill="none" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeDasharray="20,15" opacity="0.82"/>
          </g>

          {/* Hôtels */}
          {HOTELS.map((h,i) => <HotelBuilding key={i} {...h}/>)}

          {/* Cards */}
          {!hideStepCards && PINS.map((pin,i) => (
            <StepCard key={i} step={STEPS[i]} x={pin.x} y={pin.y} align={cardAligns[i]}/>
          ))}

          {/* Pins */}
          {PINS.map((pin,i) => (
            <MapPin key={i} x={pin.x} y={pin.y} color={STEPS[i].color} icon={STEPS[i].icon}/>
          ))}
        </svg>
      </div>
    </section>
  );
}
