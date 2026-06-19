"use client";

import { useEffect, useState } from "react";

// ── Bezier solver — M 300,80 C 750,80 710,270 680,520 ──────────
function bezierPt(t: number) {
  const mt = 1 - t;
  return {
    x: mt*mt*mt*300 + 3*mt*mt*t*750 + 3*mt*t*t*710 + t*t*t*680,
    y: mt*mt*mt*80  + 3*mt*mt*t*80  + 3*mt*t*t*270 + t*t*t*520,
  };
}
function bezierTangent(t: number) {
  const mt = 1 - t;
  const tx = 3*(mt*mt*(750-300) + 2*mt*t*(710-750) + t*t*(680-710));
  const ty = 3*(mt*mt*(80-80)   + 2*mt*t*(270-80)  + t*t*(520-270));
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
  { number:"01", icon:"itinerary" as const, color:"#E8644A", title:"Entrez deux villes",           desc:"Une ville de départ, une d'arrivée. La route se calcule en quelques secondes." },
  { number:"02", icon:"filter"    as const, color:"#6FA8C0", title:"Personnalisez la recherche",   desc:"Budget, borne EV, note, détour. Filtrez jusqu'au bon hôtel." },
  { number:"03", icon:"map"       as const, color:"#E8644A", title:"Cherchez sur l'itinéraire",    desc:"Cliquez sur votre route pour voir les hôtels à cette étape." },
  { number:"04", icon:"car"       as const, color:"#6FA8C0", title:"Partez en voyage",             desc:"Réservez en un clic. La route vous attend." },
];

const PINS = [
  { x:300, y:80   },
  { x:680, y:520  },
  { x:120, y:980  },
  { x:680, y:1400 },
];
const ICON_R = 24; // rayon du cercle icône
const cardAligns: ("left"|"right")[] = ["right","left","right","left"];

// Boucle = cercle propre r≈140, centre (160,840)
// 4 quarts de cercle successifs + croisement net au sommet (160,700)
const ROAD_PATH = `
  M 300,80
  C 750,80 710,270 680,520
  C 680,640 420,720 160,700
  C 83,700 20,763 20,840
  C 20,917 83,980 160,980
  C 237,980 300,917 300,840
  C 300,763 237,700 160,700
  C 140,740 120,850 120,980
  C 120,1120 400,1200 660,1180
  C 700,1178 680,1310 680,1400
`;

// ── Vue mer ───────────────────────────────────────────────────

/** Vue mer — côte à droite du rond */
function SeaView({ x, y }: { x:number; y:number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Aplat mer */}
      <rect x="0" y="8" width="440" height="220" rx="4" fill="#88C4E0" opacity="0.48"/>
      {/* Horizon — légèrement ondulé */}
      <path d="M 0,8 C 70,0 150,16 230,6 C 310,-2 380,10 440,6 L 440,8 Z"
        fill="#6AAED4" opacity="0.6"/>
      {/* Vagues */}
      <path d="M 10,50 Q 55,41 100,50 Q 145,59 190,50 Q 235,41 280,50 Q 325,59 370,50 Q 410,43 440,48"
        fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M 0,88 Q 50,80 100,88 Q 150,96 200,88 Q 250,80 300,88 Q 350,96 410,88"
        fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 20,126 Q 70,118 120,126 Q 170,134 220,126 Q 270,118 320,126"
        fill="none" stroke="rgba(255,255,255,0.26)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Île à l'horizon */}
      <ellipse cx="200" cy="7" rx="30" ry="9"  fill="#8AAAB8" opacity="0.55"/>
      <ellipse cx="200" cy="4" rx="22" ry="6"  fill="#9ABACE" opacity="0.45"/>
      {/* Voilier */}
      <g transform="translate(330,12)">
        {/* Coque */}
        <path d="M -15,7 Q 0,13 15,7 L 11,0 L -11,0 Z" fill="#C89858"/>
        {/* Grande voile */}
        <polygon points="0,-40 -18,0 18,0" fill="white" opacity="0.92"/>
        {/* Trinquette */}
        <polygon points="2,-28 18,0 3,0" fill="#EEF4FA" opacity="0.72"/>
        {/* Mât */}
        <line x1="0" y1="-40" x2="0" y2="0" stroke="#A07840" strokeWidth="1.5"/>
      </g>
      {/* Reflet soleil */}
      <path d="M 330,148 Q 358,141 385,148 Q 412,155 440,149"
        fill="none" stroke="rgba(255,235,160,0.3)" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

// ── Éléments naturels ─────────────────────────────────────────

/** Chaîne de montagnes — fond paysager */
function Mountains({ x, y }: { x:number; y:number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Lointain — brumeux */}
      <polygon points="-70,0 -38,-68 -6,0"    fill="#C8D8EC" opacity="0.5"/>
      <polygon points="-24,0  22,-86  68,0"   fill="#B8C8DC" opacity="0.5"/>
      <polygon points=" 40,0  78,-58 116,0"   fill="#C8D8EC" opacity="0.44"/>
      {/* Avant-plan */}
      <polygon points="-54,0   2,-122  58,0"  fill="#94AEC6"/>
      <polygon points="  8,0  76,-138 144,0"  fill="#84A0B8"/>
      <polygon points=" 84,0 122,-80  160,0"  fill="#94AEC6" opacity="0.88"/>
      {/* Flancs ombre */}
      <polygon points="2,-122 58,0 -4,0"      fill="#7090A8" opacity="0.22"/>
      <polygon points="76,-138 144,0 108,0"   fill="#7090A8" opacity="0.2"/>
      {/* Neige */}
      <polygon points="-8,-90  2,-122  12,-90" fill="white" opacity="0.74"/>
      <polygon points="66,-104 76,-138 86,-104" fill="white" opacity="0.74"/>
      {/* Reflet neige (face ombre) */}
      <polygon points="-8,-90  2,-122 -4,-98"  fill="#C4D4E8" opacity="0.5"/>
      <polygon points="66,-104 76,-138 70,-112" fill="#C4D4E8" opacity="0.5"/>
    </g>
  );
}

/** 3 tournesols — typiques des routes de France */
function SunflowerField({ x, y }: { x:number; y:number }) {
  const flowers: { dx:number; h:number; s:number }[] = [
    { dx:-18, h:44, s:1.12 },
    { dx:  0, h:36, s:1.0  },
    { dx: 17, h:29, s:0.86 },
  ];
  return (
    <g transform={`translate(${x},${y})`}>
      {flowers.map((f, i) => (
        <g key={i} transform={`translate(${f.dx},0)`}>
          <line x1="0" y1="0" x2="0" y2={-f.h} stroke="#4A7A30" strokeWidth="2.5" strokeLinecap="round"/>
          <ellipse cx={i%2===0 ? -6:6} cy={-f.h*0.42} rx="7" ry="3.5" fill="#4A7A30"
            transform={`rotate(${i%2===0?-28:28},${i%2===0?-6:6},${-f.h*0.42})`}/>
          {/* Pétales : 8 ellipses tournantes */}
          {[0,45,90,135,180,225,270,315].map(a => (
            <ellipse key={a} cx="0" cy={-f.h-9} rx="3" ry="8" fill="#F5C842"
              opacity="0.95" transform={`rotate(${a},0,${-f.h})`}/>
          ))}
          <circle cx="0" cy={-f.h} r="8"   fill="#7B4A18"/>
          <circle cx="0" cy={-f.h} r="5.5" fill="#5A3010" opacity="0.85"/>
          <circle cx={-2} cy={-f.h-1} r="1.5" fill="rgba(255,255,255,0.2)"/>
        </g>
      ))}
    </g>
  );
}

/** Coquelicots — fleurs sauvages des bords de route */
function PoppyPatch({ x, y }: { x:number; y:number }) {
  const poppies: { dx:number; dy:number; h:number; s:number }[] = [
    { dx:0,   dy:0,  h:14, s:1.0  },
    { dx:13,  dy:-3, h:11, s:0.85 },
    { dx:-10, dy:-1, h:17, s:1.1  },
    { dx:22,  dy:2,  h:10, s:0.78 },
    { dx:6,   dy:-9, h:19, s:1.15 },
    { dx:-17, dy:3,  h:13, s:0.9  },
  ];
  return (
    <g transform={`translate(${x},${y})`}>
      {poppies.map((p, i) => (
        <g key={i} transform={`translate(${p.dx},${p.dy}) scale(${p.s})`}>
          <line x1="0" y1="0" x2="0" y2={p.h} stroke="#4A7A30" strokeWidth="1.5" strokeLinecap="round"/>
          {/* 4 pétales arrondis */}
          {[0,90,180,270].map(a => (
            <ellipse key={a} cx="0" cy={-7} rx="4.5" ry="7.5" fill="#E8644A"
              opacity="0.92" transform={`rotate(${a},0,0)`}/>
          ))}
          <circle cx="0" cy="0" r="3.5" fill="#1A1020" opacity="0.88"/>
          <circle cx="0" cy="-1" r="1.4" fill="rgba(255,255,255,0.3)"/>
        </g>
      ))}
    </g>
  );
}

/** Épis de blé — champs dorés */
function WheatField({ x, y }: { x:number; y:number }) {
  const stalks = Array.from({ length: 14 }, (_, i) => ({
    dx: i * 7 + (i % 2) * 3,
    h:  22 + (i % 3) * 5,
  }));
  return (
    <g transform={`translate(${x},${y})`}>
      {stalks.map((s, i) => (
        <g key={i} transform={`translate(${s.dx},0)`}>
          <line x1="0" y1="0" x2="0" y2={-s.h} stroke="#C8A840" strokeWidth="1.8" strokeLinecap="round"/>
          {/* Épi */}
          <ellipse cx="0" cy={-s.h-5} rx="2.8" ry="7" fill="#D4B030" opacity="0.92"/>
          {/* Barbes */}
          <line x1="0" y1={-s.h-4} x2="-5" y2={-s.h-12} stroke="#C8A040" strokeWidth="0.9" opacity="0.6"/>
          <line x1="0" y1={-s.h-4} x2=" 5" y2={-s.h-12} stroke="#C8A040" strokeWidth="0.9" opacity="0.6"/>
          <line x1="0" y1={-s.h-7} x2="-4" y2={-s.h-14} stroke="#C8A040" strokeWidth="0.8" opacity="0.5"/>
          <line x1="0" y1={-s.h-7} x2=" 4" y2={-s.h-14} stroke="#C8A040" strokeWidth="0.8" opacity="0.5"/>
        </g>
      ))}
    </g>
  );
}

/** Rangées de vignes — Sud de la France */
function Vineyard({ x, y }: { x:number; y:number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {[0,1,2,3].map(r => {
        const ry = r * 14;
        return (
          <g key={r}>
            {/* Sol entre rangs */}
            <line x1="0" y1={ry} x2="64" y2={ry} stroke="#A89060" strokeWidth="1" opacity="0.25"/>
            {[0,1,2,3,4,5].map(p => {
              const px = 5 + p * 11;
              return (
                <g key={p} transform={`translate(${px},${ry})`}>
                  {/* Piquet */}
                  <line x1="0" y1="1" x2="0" y2="-13" stroke="#C0A070" strokeWidth="1.2" opacity="0.55"/>
                  {/* Feuillage */}
                  <ellipse cx="0" cy="-13" rx="6" ry="4.5" fill="#4A8030" opacity="0.88"/>
                  <ellipse cx="-3" cy="-11" rx="4" ry="3" fill="#3A7020" opacity="0.7"/>
                  {/* Grappe de raisin */}
                  <ellipse cx=" 2" cy="-8" rx="3.5" ry="4.5" fill="#7A5898" opacity="0.78"/>
                  <ellipse cx="-1" cy="-8" rx="2.5" ry="3.5" fill="#6A4888" opacity="0.65"/>
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}


/** Botte de foin ronde */
function HayBale({ x, y, s=1 }: { x:number; y:number; s?:number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx="0" cy="8" rx="21" ry="5" fill="rgba(0,0,0,0.08)"/>
      <circle cx="0" cy="0" r="18" fill="#D4A840"/>
      {/* Cerceaux de foin */}
      {[5,9,13,17].map(r => (
        <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="#A87C18" strokeWidth="1.2" opacity="0.4"/>
      ))}
      {/* Lignes radiales */}
      {[0,60,120,180,240,300].map(a => (
        <line key={a}
          x1={Math.cos(a*Math.PI/180)*5} y1={Math.sin(a*Math.PI/180)*5}
          x2={Math.cos(a*Math.PI/180)*17} y2={Math.sin(a*Math.PI/180)*17}
          stroke="#A87C18" strokeWidth="0.8" opacity="0.3"/>
      ))}
      <circle cx="0" cy="0" r="18" fill="none" stroke="#A07818" strokeWidth="1.5"/>
      <circle cx="-5" cy="-5" r="5" fill="rgba(255,255,255,0.1)"/>
    </g>
  );
}

/** Rivière — méandre de campagne */
function River({ x, y }: { x:number; y:number }) {
  return (
    <g transform={`translate(${x},${y})`} opacity="0.78">
      {/* Berges (plus large, plus clair) */}
      <path d="M 0,0 C 25,18 65,8 95,30 C 125,52 155,42 185,60"
        fill="none" stroke="#9ACCE0" strokeWidth="16" strokeLinecap="round"/>
      {/* Eau */}
      <path d="M 0,0 C 25,18 65,8 95,30 C 125,52 155,42 185,60"
        fill="none" stroke="#6AB4D0" strokeWidth="10" strokeLinecap="round"/>
      {/* Reflet */}
      <path d="M 8,5 C 32,22 70,12 99,33 C 128,55 157,45 185,60"
        fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round"/>
    </g>
  );
}

/** Rangées de lavande — Provence */
function LavenderField({ x, y }: { x:number; y:number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {[0,1,2,3,4].map(r => {
        const ry = r * 13;
        return (
          <g key={r}>
            {[0,1,2,3,4,5,6].map(p => {
              const px = p * 10;
              return (
                <g key={p} transform={`translate(${px},${ry})`}>
                  {/* Tige */}
                  <line x1="0" y1="0" x2="0" y2="-20" stroke="#6A8850" strokeWidth="2" strokeLinecap="round"/>
                  {/* Épi floral — 3 ellipses superposées */}
                  <ellipse cx="0"  cy="-23" rx="2.8" ry="7"   fill="#9B7ED0" opacity="0.92"/>
                  <ellipse cx="-2" cy="-20" rx="2"   ry="4.5" fill="#8B6EC0" opacity="0.72"/>
                  <ellipse cx=" 2" cy="-20" rx="2"   ry="4.5" fill="#8B6EC0" opacity="0.72"/>
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

// ── Soleil, Montgolfière, Voiture ─────────────────────────────

function Sun({ x, y, s=1 }: { x:number; y:number; s?:number }) {
  const rays = [0,30,60,90,120,150,180,210,240,270,300,330];
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <circle cx="0" cy="0" r="60" fill="#F9D55A" opacity="0.09"/>
      <circle cx="0" cy="0" r="46" fill="#F9D55A" opacity="0.16"/>
      {rays.map(a => (
        <line key={a}
          x1={Math.cos(a*Math.PI/180)*34} y1={Math.sin(a*Math.PI/180)*34}
          x2={Math.cos(a*Math.PI/180)*48} y2={Math.sin(a*Math.PI/180)*48}
          stroke="#F9D55A" strokeWidth="3.5" strokeLinecap="round"/>
      ))}
      <circle cx="0" cy="0" r="28" fill="#F9D55A"/>
      <circle cx="-8" cy="-8" r="9" fill="rgba(255,255,255,0.28)"/>
    </g>
  );
}

function HotAirBalloon({ x, y }: { x:number; y:number }) {
  // Forme poire réaliste d'une vraie montgolfière
  const body = "M 0,-74 C 42,-72 66,-36 66,-4 C 66,30 46,62 0,70 C -46,62 -66,30 -66,-4 C -66,-36 -42,-72 0,-74 Z";
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id="balloonClip">
          <path d={body}/>
        </clipPath>
      </defs>

      {/* ─ Enveloppe ─ */}
      {/* Base bleue */}
      <path d={body} fill="#6FA8C0"/>

      {/* Panneaux verticaux clippés */}
      <g clipPath="url(#balloonClip)">
        {/* 3 panneaux coral + 2 jaunes + espaces bleus */}
        <rect x="-66" y="-74" width="26" height="144" fill="#E8644A" opacity="0.88"/>
        <rect x="-18" y="-74" width="36" height="144" fill="#F5C842" opacity="0.82"/>
        <rect x=" 40" y="-74" width="26" height="144" fill="#E8644A" opacity="0.88"/>
        {/* Lisérés entre panneaux */}
        <line x1="-40" y1="-74" x2="-40" y2="70" stroke="rgba(0,0,0,0.08)" strokeWidth="1.2"/>
        <line x1="-18" y1="-74" x2="-18" y2="70" stroke="rgba(0,0,0,0.07)" strokeWidth="1"/>
        <line x1=" 18" y1="-74" x2=" 18" y2="70" stroke="rgba(0,0,0,0.07)" strokeWidth="1"/>
        <line x1=" 40" y1="-74" x2=" 40" y2="70" stroke="rgba(0,0,0,0.08)" strokeWidth="1.2"/>
        {/* Reflet haut-gauche → effet 3D */}
        <ellipse cx="-22" cy="-32" rx="18" ry="28" fill="rgba(255,255,255,0.13)"/>
        {/* Ombrage bord droit */}
        <rect x="54" y="-74" width="12" height="144" fill="rgba(0,0,0,0.08)"/>
      </g>

      {/* Contour fin */}
      <path d={body} fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5"/>

      {/* Couronne (sommet) */}
      <ellipse cx="0" cy="-74" rx="20" ry="7"  fill="#3A7890"/>
      <ellipse cx="0" cy="-74" rx="12" ry="4"  fill="#2A6880"/>

      {/* Bouche (bas de l'enveloppe) */}
      <ellipse cx="0" cy="70" rx="22" ry="7" fill="rgba(20,40,60,0.35)"/>

      {/* ─ Cordes en trapèze ─ */}
      <line x1="-30" y1="64" x2="-18" y2="96" stroke="#8B6433" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1=" 30" y1="64" x2=" 18" y2="96" stroke="#8B6433" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="-10" y1="70" x2="-8"  y2="96" stroke="#8B6433" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1=" 10" y1="70" x2=" 8"  y2="96" stroke="#8B6433" strokeWidth="1.3" strokeLinecap="round"/>
      {/* Anneau de jonction cordes */}
      <ellipse cx="0" cy="96" rx="19" ry="4" fill="rgba(100,70,30,0.3)"/>

      {/* ─ Nacelle tressée ─ */}
      <rect x="-19" y="96" width="38" height="28" rx="5" fill="#C8A050"/>
      {/* Bord supérieur */}
      <rect x="-21" y="93" width="42" height="6" rx="3" fill="#D8B865"/>
      {/* Tressage horizontal */}
      <line x1="-19" y1="108" x2="19" y2="108" stroke="#9A7828" strokeWidth="1.2" opacity="0.5"/>
      <line x1="-19" y1="116" x2="19" y2="116" stroke="#9A7828" strokeWidth="1"   opacity="0.4"/>
      {/* Tressage vertical */}
      {[-13,-6,1,8,14].map(bx => (
        <line key={bx} x1={bx} y1="99" x2={bx} y2="124" stroke="#9A7828" strokeWidth="1" opacity="0.4"/>
      ))}
      {/* Bord inférieur nacelle */}
      <rect x="-19" y="120" width="38" height="4" rx="2" fill="#B89040"/>
    </g>
  );
}

function Car({ x, y, rotation=0, flipX=false, bodyColor="#E8644A", roofColor="#D4583A", bumperColor="#C44428" }: { x:number; y:number; rotation?:number; flipX?:boolean; bodyColor?:string; roofColor?:string; bumperColor?:string }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${rotation}) scale(${flipX ? -1 : 1},1)`}>
      {/* Ombre */}
      <ellipse cx="2" cy="15" rx="27" ry="5" fill="rgba(0,0,0,0.14)"/>
      {/* Carrosserie */}
      <rect x="-26" y="-6" width="54" height="17" rx="6" fill={bodyColor}/>
      {/* Toit / habitacle */}
      <rect x="-14" y="-20" width="30" height="16" rx="6" fill={roofColor}/>
      {/* Vitres */}
      <rect x="-12" y="-18" width="12" height="11" rx="2.5" fill="#D6EEFF" opacity="0.88"/>
      <rect x="2"   y="-18" width="12" height="11" rx="2.5" fill="#D6EEFF" opacity="0.88"/>
      <line x1="1" y1="-18" x2="1" y2="-7" stroke={bumperColor} strokeWidth="1.5"/>
      {/* Roues */}
      <circle cx="-15" cy="11" r="7.5" fill="#242830"/>
      <circle cx="-15" cy="11" r="4.5" fill="#484E5C"/>
      <circle cx="-15" cy="11" r="1.5" fill="#B8C0D0"/>
      <circle cx=" 17" cy="11" r="7.5" fill="#242830"/>
      <circle cx=" 17" cy="11" r="4.5" fill="#484E5C"/>
      <circle cx=" 17" cy="11" r="1.5" fill="#B8C0D0"/>
      {/* Phare avant */}
      <circle cx="-27" cy="-2" r="3" fill="#FFE090" opacity="0.85"/>
      {/* Pare-chocs */}
      <rect x="-30" y="0" width="5" height="9" rx="2.5" fill={bumperColor}/>
    </g>
  );
}

function Convertible({ x, y, rotation=0 }: { x:number; y:number; rotation?:number }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${rotation})`}>
      {/* Ombre longue */}
      <ellipse cx="2" cy="16" rx="34" ry="4.5" fill="rgba(0,0,0,0.13)"/>
      {/* Carrosserie basse et longue — ligne de luxe */}
      <path d="M -32,8 Q -34,-4 -22,-8 L 28,-8 Q 36,-8 34,8 Z" fill="#F5C842"/>
      {/* Capot plongeant avant */}
      <path d="M -22,-8 L -32,-4 L -32,2 L -22,2 Z" fill="#E0B030"/>
      {/* Coffre arrière */}
      <path d="M 28,-8 L 34,-4 L 34,2 L 26,2 Z" fill="#E0B030"/>
      {/* Habitacle ouvert décapotable */}
      <path d="M -10,-8 L -4,-18 L 20,-18 L 24,-8 Z" fill="#D4A020" opacity="0.55"/>
      {/* Pare-brise incliné */}
      <path d="M -4,-18 L 0,-22 L 18,-22 L 20,-18 Z" fill="#D6EEFF" opacity="0.85"/>
      {/* Intérieur — cuir beige luxe */}
      <path d="M -8,-8 L -2,-16 L 12,-16 L 16,-8 Z" fill="#C8A060" opacity="0.5"/>
      {/* Appuie-tête conducteur */}
      <ellipse cx="4" cy="-16" rx="4" ry="3" fill="#B89050" opacity="0.8"/>
      {/* Ligne chromée latérale */}
      <line x1="-28" y1="-1" x2="30" y2="-1" stroke="#FFE090" strokeWidth="1" opacity="0.5"/>
      {/* Roues larges sport */}
      <circle cx="-18" cy="12" r="8.5" fill="#1A1A22"/>
      <circle cx="-18" cy="12" r="5.5" fill="#38404E"/>
      <circle cx="-18" cy="12" r="2"   fill="#C8D0E0"/>
      <circle cx=" 20" cy="12" r="8.5" fill="#1A1A22"/>
      <circle cx=" 20" cy="12" r="5.5" fill="#38404E"/>
      <circle cx=" 20" cy="12" r="2"   fill="#C8D0E0"/>
      {/* Phares fins LED */}
      <rect x="-34" y="-5" width="6" height="2.5" rx="1.2" fill="#FFF4C0" opacity="0.95"/>
      <rect x="-34" y="-2" width="4" height="1.5" rx="0.8" fill="#FFE090" opacity="0.6"/>
      {/* Calandre */}
      <rect x="-34" y="1" width="6" height="4" rx="1.5" fill="#C8940A"/>
    </g>
  );
}

// ── Arbres & décors ───────────────────────────────────────────
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

// ── Hébergements ──────────────────────────────────────────────

/** Étape 2 — Grand hôtel classique (5 étages, drapeau, auvent) */
function GrandHotel({ x, y }: { x:number; y:number }) {
  // Palace haussmannien — ailes latérales, mansarde, colonnes, fontaine
  return (
    <g transform={`translate(${x},${y})`}>
      {/* ── Ombre au sol ── */}
      <ellipse cx="0" cy="18" rx="88" ry="10" fill="rgba(0,0,0,0.08)"/>

      {/* ══ Aile gauche ══ */}
      <rect x="-90" y="-110" width="38" height="126" fill="#EDE5D8" rx="1"/>
      {/* Corniche aile G */}
      <rect x="-92" y="-112" width="42" height="6" fill="#D4C4A8" rx="1"/>
      {/* Mansarde aile G */}
      <rect x="-88" y="-128" width="34" height="18" fill="#8B7355" rx="1"/>
      <rect x="-86" y="-126" width="30" height="2" fill="rgba(255,255,255,0.2)"/>
      {/* Lucarne aile G */}
      <rect x="-80" y="-126" width="10" height="10" rx="1" fill="#B8D9F0" opacity="0.85"/>
      <line x1="-75" y1="-126" x2="-75" y2="-116" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
      {/* Fenêtres aile G — 3 rangées × 2 */}
      {[0,1,2].flatMap(row => [-82,-67].map(col => (
        <g key={`wgl${row}${col}`}>
          <rect x={col} y={-102+row*28} width="11" height="16" rx="1" fill="#B8D9F0" opacity="0.88"/>
          <rect x={col+1} y={-102+row*28} width="4" height="16" rx="0" fill="rgba(255,255,255,0.15)"/>
          {/* Volet */}
          <rect x={col-3} y={-103+row*28} width="3" height="17" rx="0.5" fill="#C8B090" opacity="0.7"/>
          <rect x={col+12} y={-103+row*28} width="3" height="17" rx="0.5" fill="#C8B090" opacity="0.7"/>
        </g>
      )))}

      {/* ══ Corps central ══ */}
      <rect x="-52" y="-148" width="104" height="164" fill="#F5EEE4" rx="1"/>
      {/* Corniche principale */}
      <rect x="-56" y="-150" width="112" height="8" fill="#D4C4A8" rx="1"/>
      <rect x="-54" y="-148" width="108" height="3" fill="rgba(255,255,255,0.30)"/>
      {/* Mansarde centrale */}
      <rect x="-50" y="-174" width="100" height="26" fill="#7A6448" rx="1"/>
      {/* Détail mansarde — zinc */}
      <rect x="-48" y="-172" width="96" height="3" fill="rgba(255,255,255,0.18)"/>
      {/* 3 lucarnes mansarde */}
      {[-30, 0, 30].map(lx => (
        <g key={`luc${lx}`}>
          <rect x={lx-8} y={-170} width="16" height="16" rx="2" fill="#F5EEE4"/>
          <rect x={lx-6} y={-168} width="12" height="12" rx="1" fill="#B8D9F0" opacity="0.9"/>
          <line x1={lx} y1="-168" x2={lx} y2="-156" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
          {/* Fronton lucarne */}
          <polygon points={`${lx-9},-171 ${lx},-178 ${lx+9},-171`} fill="#8B7355"/>
        </g>
      ))}
      {/* Mâts + drapeaux */}
      <line x1="-2" y1="-174" x2="-2" y2="-194" stroke="#B8A070" strokeWidth="1.5"/>
      <polygon points="-2,-194 18,-188 -2,-182" fill="#E8644A"/>
      <line x1="40" y1="-168" x2="40" y2="-184" stroke="#B8A070" strokeWidth="1.2"/>
      <polygon points="40,-184 56,-179 40,-174" fill="#6FA8C0"/>
      <line x1="-44" y1="-168" x2="-44" y2="-184" stroke="#B8A070" strokeWidth="1.2"/>
      <polygon points="-44,-184 -28,-179 -44,-174" fill="#E8644A"/>

      {/* Fenêtres centrales — 4 rangées × 4 */}
      {[0,1,2,3].flatMap(row => [-36,-13,10,33].map(col => (
        <g key={`wc${row}${col}`}>
          <rect x={col} y={-138+row*28} width="13" height="18" rx="1.5" fill="#B8D9F0" opacity="0.9"/>
          <line x1={col+6.5} y1={-138+row*28} x2={col+6.5} y2={-120+row*28} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
          <line x1={col} y1={-129+row*28} x2={col+13} y2={-129+row*28} stroke="rgba(255,255,255,0.3)" strokeWidth="0.6"/>
          {/* Appui de fenêtre */}
          <rect x={col-1} y={-121+row*28} width="15" height="2" rx="0.5" fill="#C8B898"/>
        </g>
      )))}

      {/* Balcons fer forgé — rangée 2 et 4 */}
      {[1,3].flatMap(row => [-36,-13,10,33].map(col => (
        <g key={`bal${row}${col}`}>
          <rect x={col-2} y={-112+row*28} width="17" height="3" rx="0.5" fill="#8B7B6B"/>
          {[0,1,2,3,4].map(i => (
            <line key={i} x1={col-1+i*3.5} y1={-112+row*28} x2={col-1+i*3.5} y2={-109+row*28}
              stroke="#8B7B6B" strokeWidth="1"/>
          ))}
        </g>
      )))}

      {/* ══ Aile droite ══ */}
      <rect x="52" y="-110" width="38" height="126" fill="#EDE5D8" rx="1"/>
      <rect x="50" y="-112" width="42" height="6" fill="#D4C4A8" rx="1"/>
      <rect x="54" y="-128" width="34" height="18" fill="#8B7355" rx="1"/>
      <rect x="56" y="-126" width="30" height="2" fill="rgba(255,255,255,0.2)"/>
      <rect x="70" y="-126" width="10" height="10" rx="1" fill="#B8D9F0" opacity="0.85"/>
      <line x1="75" y1="-126" x2="75" y2="-116" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
      {[0,1,2].flatMap(row => [56,71].map(col => (
        <g key={`wgr${row}${col}`}>
          <rect x={col} y={-102+row*28} width="11" height="16" rx="1" fill="#B8D9F0" opacity="0.88"/>
          <rect x={col+1} y={-102+row*28} width="4" height="16" rx="0" fill="rgba(255,255,255,0.15)"/>
          <rect x={col-3} y={-103+row*28} width="3" height="17" rx="0.5" fill="#C8B090" opacity="0.7"/>
          <rect x={col+12} y={-103+row*28} width="3" height="17" rx="0.5" fill="#C8B090" opacity="0.7"/>
        </g>
      )))}

      {/* ══ Portique RDC — 4 colonnes ══ */}
      {[-36,-12,12,36].map(cx => (
        <g key={`col${cx}`}>
          {/* Fût */}
          <rect x={cx-3} y={-32} width="6" height="36" fill="#E8E0D0" rx="1"/>
          {/* Chapiteau */}
          <rect x={cx-5} y={-34} width="10" height="4" rx="0.5" fill="#D4C4A8"/>
          {/* Base */}
          <rect x={cx-4} y="4" width="8" height="3" rx="0.5" fill="#D4C4A8"/>
        </g>
      ))}
      {/* Entablement sur colonnes */}
      <rect x="-42" y="-36" width="84" height="6" fill="#D4C4A8" rx="1"/>
      {/* Auvent rayé */}
      <rect x="-42" y="-38" width="84" height="6" fill="#1E1E2E" rx="1" opacity="0.85"/>
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <rect key={i} x={-41+i*8.5} y="-38" width="4" height="6" rx="0" fill="#F5C842" opacity="0.7"/>
      ))}
      {/* Lettre enseigne */}
      <rect x="-28" y="-34" width="56" height="3" rx="1" fill="rgba(255,255,255,0.15)"/>

      {/* ── Porte centrale double ── */}
      <rect x="-14" y="-20" width="28" height="36" rx="2" fill="#6A5240"/>
      <rect x="-14" y="-20" width="13" height="36" rx="2" fill="#7A6250"/>
      <rect x="-13" y="-18" width="5" height="20" rx="1" fill="rgba(255,255,255,0.12)"/>
      <rect x="1"   y="-18" width="5" height="20" rx="1" fill="rgba(255,255,255,0.12)"/>
      {/* Poignées */}
      <circle cx="-2" cy="-4" r="1.5" fill="#D4A840"/>
      <circle cx="2"  cy="-4" r="1.5" fill="#D4A840"/>
      {/* Arche porte */}
      <path d="M-14,-20 Q0,-32 14,-20" fill="#5A4230" opacity="0.6"/>

      {/* ── Fenêtres RDC latérales ── */}
      {[-44, 30].map(wx => (
        <g key={`rdcw${wx}`}>
          <rect x={wx} y="-28" width="20" height="24" rx="1.5" fill="#B8D9F0" opacity="0.88"/>
          <line x1={wx+10} y1="-28" x2={wx+10} y2="-4" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
          <line x1={wx} y1="-16" x2={wx+20} y2="-16" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6"/>
        </g>
      ))}

      {/* ── Fontaine devant ── */}
      <ellipse cx="0" cy="28" rx="28" ry="9" fill="#A8D0E8" opacity="0.6"/>
      <ellipse cx="0" cy="28" rx="28" ry="9" fill="none" stroke="#8BBAD4" strokeWidth="1.2" opacity="0.8"/>
      <ellipse cx="0" cy="26" rx="12" ry="4" fill="#C8E4F4" opacity="0.5"/>
      {/* Vasque */}
      <ellipse cx="0" cy="22" rx="8" ry="3" fill="#D4C4A8" opacity="0.9"/>
      {/* Jet */}
      <path d="M0,20 Q-3,14 -1,10" fill="none" stroke="#A8D0E8" strokeWidth="1.5" opacity="0.7"/>
      <path d="M0,20 Q3,13 1,9"  fill="none" stroke="#A8D0E8" strokeWidth="1.5" opacity="0.7"/>
      <path d="M0,20 Q0,12 0,8"  fill="none" stroke="#C8E4F4" strokeWidth="2"   opacity="0.8"/>
    </g>
  );
}

/** Étape 3 — Petit hôtel / Auberge (2 étages, toit pentu, charme) */
function SmallHotel({ x, y }: { x:number; y:number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="2" cy="12" rx="30" ry="6" fill="rgba(0,0,0,0.07)"/>
      {/* Corps */}
      <rect x="-24" y="-54" width="48" height="66" fill="#EDE8DF" rx="2"/>
      {/* Toit pentu */}
      <polygon points="-28,-54 0,-80 28,-54" fill="#7A5830"/>
      <polygon points="-26,-54 0,-77 26,-54" fill="#9B7040"/>
      {/* Cheminée */}
      <rect x="10" y="-78" width="7" height="20" rx="1" fill="#6A4A28"/>
      <rect x="9"  y="-80" width="9" height="4"  rx="1" fill="#5A3A20"/>
      {/* Fumée */}
      <circle cx="14" cy="-84" r="3.5" fill="#C8D4E0" opacity="0.45"/>
      <circle cx="16" cy="-90" r="2.5" fill="#C8D4E0" opacity="0.28"/>
      {/* Fenêtres étage */}
      <rect x="-17" y="-44" width="13" height="13" rx="1.5" fill="#B8D9F0" opacity="0.9"/>
      <rect x="4"   y="-44" width="13" height="13" rx="1.5" fill="#B8D9F0" opacity="0.9"/>
      {/* Bacs à fleurs */}
      <rect x="-17" y="-32" width="13" height="3" rx="1" fill="#7B5533"/>
      <rect x="4"   y="-32" width="13" height="3" rx="1" fill="#7B5533"/>
      {[...Array(4)].map((_,i) => <circle key={i} cx={-14+i*4} cy="-33" r="2" fill="#E8644A" opacity="0.8"/>)}
      {[...Array(4)].map((_,i) => <circle key={i} cx={7+i*4}  cy="-33" r="2" fill="#E8644A" opacity="0.8"/>)}
      {/* Porte */}
      <rect x="-6" y="-12" width="12" height="24" rx="1" fill="#9B7B5A"/>
      <circle cx="4" cy="2" r="1.5" fill="#C8A87A"/>
      {/* Fenêtres RDC */}
      <rect x="-21" y="-18" width="11" height="11" rx="1.5" fill="#B8D9F0" opacity="0.9"/>
      <rect x="10"  y="-18" width="11" height="11" rx="1.5" fill="#B8D9F0" opacity="0.9"/>
      {/* Enseigne */}
      <rect x="-16" y="-57" width="32" height="6" rx="2" fill="#5A8A5E"/>
    </g>
  );
}

/** Étape 4 — Roulotte vintage (hébergement original) */
function Roulotte({ x, y }: { x:number; y:number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="22" rx="42" ry="8" fill="rgba(0,0,0,0.09)"/>
      {/* Corps arrondi */}
      <rect x="-36" y="-44" width="72" height="66" rx="14" fill="#6FA8C0"/>
      {/* Toit bombé */}
      <rect x="-38" y="-54" width="76" height="18" rx="9" fill="#4A88A0"/>
      {/* Reflet toit */}
      <rect x="-32" y="-52" width="50" height="6" rx="3" fill="rgba(255,255,255,0.14)"/>
      {/* Panneau corps */}
      <rect x="-30" y="-38" width="60" height="44" rx="10" fill="rgba(255,255,255,0.1)"/>
      {/* Porte */}
      <rect x="-8" y="-18" width="16" height="40" rx="4" fill="#3A6880"/>
      <rect x="-8" y="-18" width="16" height="18" rx="4" fill="#4A98B0" opacity="0.3"/>
      <circle cx="5" cy="8" r="2.5" fill="#FFD166"/>
      {/* Fenêtres */}
      <rect x="-30" y="-32" width="17" height="15" rx="3" fill="#B8D9F0" opacity="0.85"/>
      <line x1="-22" y1="-32" x2="-22" y2="-17" stroke="#4A88A0" strokeWidth="1"/>
      <line x1="-30" y1="-25" x2="-13" y2="-25" stroke="#4A88A0" strokeWidth="1"/>
      <rect x="13"  y="-32" width="17" height="15" rx="3" fill="#B8D9F0" opacity="0.85"/>
      <line x1="21" y1="-32" x2="21"  y2="-17" stroke="#4A88A0" strokeWidth="1"/>
      <line x1="13" y1="-25" x2="30"  y2="-25" stroke="#4A88A0" strokeWidth="1"/>
      {/* Marches */}
      <rect x="-6"  y="22" width="12" height="4" rx="1" fill="#3A6880"/>
      <rect x="-8"  y="26" width="16" height="4" rx="1" fill="#306070"/>
      {/* Roues */}
      <circle cx="-22" cy="22" r="13" fill="#2A3848"/>
      <circle cx="-22" cy="22" r="8"  fill="#3A4858"/>
      <circle cx="-22" cy="22" r="3"  fill="#FFD166"/>
      {[-1,1].flatMap((sx,i) => [-1,1].map((sy,j) => (
        <line key={`sp${i}${j}`} x1={-22} y1={22} x2={-22+sx*8} y2={22+sy*8}
          stroke="#2A3848" strokeWidth="2" opacity="0.5"/>
      )))}
      <circle cx="22"  cy="22" r="13" fill="#2A3848"/>
      <circle cx="22"  cy="22" r="8"  fill="#3A4858"/>
      <circle cx="22"  cy="22" r="3"  fill="#FFD166"/>
      {/* Détails décoratifs */}
      <circle cx="-30" cy="-44" r="5" fill="#FFD166" opacity="0.5"/>
      <circle cx="-22" cy="-50" r="3.5" fill="#FFD166" opacity="0.32"/>
      <circle cx="28"  cy="-48" r="4" fill="#FFD166" opacity="0.38"/>
    </g>
  );
}

// ── Icône étape (cercle simple, sans pin) ─────────────────────
function StepCircle({ x, y, color, icon }: { x:number; y:number; color:string; icon:string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Glow externe */}
      <circle cx="0" cy="0" r={ICON_R+8} fill={color} opacity="0.1"/>
      {/* Cercle principal */}
      <circle cx="0" cy="1" r={ICON_R} fill={color} opacity="0.18"/>
      <circle cx="0" cy="0" r={ICON_R} fill={color}
        style={{ filter:`drop-shadow(0 4px 12px ${color}66)` }}/>
      {/* Fond blanc */}
      <circle cx="0" cy="0" r={ICON_R-5} fill="white"/>
      {/* Icône */}
      <PinIcon name={icon as IconName} color={color}/>
    </g>
  );
}

function StepCard({
  step, x, y, align, cardYOffset=0,
}: {
  step: typeof STEPS[0]; x: number; y: number; align: "left"|"right"; cardYOffset?: number;
}) {
  const cw = 168, ch = 40;
  const cx = align === "right" ? x + ICON_R + 14 : x - ICON_R - 14 - cw;
  const cy = (y + cardYOffset) - ch / 2;

  return (
    <g>
      {/* Connecteur tirets */}
      <line
        x1={align === "right" ? x + ICON_R : x - ICON_R} y1={y}
        x2={align === "right" ? x + ICON_R + 14 : x - ICON_R - 14} y2={y + cardYOffset}
        stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeDasharray="3,3"/>

      {/* Carte */}
      <rect x={cx} y={cy} width={cw} height={ch} rx="12"
        fill="rgba(255,255,255,0.93)"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }}/>
      {/* Badge numéro */}
      <rect x={cx+10} y={cy+10} width={22} height={20} rx="6" fill={step.color} opacity="0.12"/>
      <text x={cx+21} y={cy+22.5} textAnchor="middle"
        fontFamily="'Nunito',sans-serif" fontWeight="900" fontSize="7" fill={step.color}>
        {step.number}
      </text>
      {/* Titre */}
      <text x={cx+38} y={cy+22.5}
        fontFamily="'Nunito',sans-serif" fontWeight="800" fontSize="8" fill="#1E1E2E">
        {step.title}
      </text>
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

  const cutR = ICON_R + 6; // rayon de découpe route autour de chaque icône

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
            {/* Masque route : découpe autour de chaque icône uniquement (pas le titre) */}
            <mask id="roadMask">
              <rect x="0" y="0" width="800" height="1540" fill="white"/>
              {PINS.map((pin, i) => (
                <circle key={i} cx={pin.x} cy={pin.y} r={cutR} fill="black"/>
              ))}
            </mask>
          </defs>

          {/* Fond */}
          <rect x="0" y="0" width="800" height="1540" fill="url(#skyGrad)"/>

          {/* Soleil — haut gauche, route à x=630+ ici */}
          <Sun x={148} y={195} s={0.9}/>

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

          {/* Montgolfière — posée sur le grand arc de la route (haut de l'ovale) */}
          <HotAirBalloon x={490} y={870}/>

          {/* Arbres */}
          <PineTree  x={750} y={380} s={0.88}/>
          <RoundTree x={738} y={470} s={0.80}/>
          <RoundTree x={28}  y={730} s={0.84}/>
          <PineTree  x={14}  y={840} s={0.78}/>
          <RoundTree x={30}  y={960} s={0.80}/>
          <PineTree  x={14}  y={1060} s={0.76}/>
          <PineTree  x={750} y={1200} s={0.82}/>
          <RoundTree x={738} y={1300} s={0.74}/>

          {/* Route — masquée autour des icônes et du titre */}
          <g mask="url(#roadMask)">
            <path d={ROAD_PATH} fill="none" stroke="rgba(160,50,20,0.16)" strokeWidth="34"
              strokeLinecap="round" strokeLinejoin="round" transform="translate(2,5)"/>
            <path d={ROAD_PATH} fill="none" stroke="#E8644A" strokeWidth="28"
              strokeLinecap="round" strokeLinejoin="round"/>
            <path d={ROAD_PATH} fill="none" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeDasharray="20,15" opacity="0.82"/>
          </g>

          {/* Voiture orange — milieu route, segment 2 (t≈0.35 : x=595, y=628, angle 150°) */}
          <Car x={595} y={658} rotation={150} flipX={true}/>

          {/* Décapotable jaune — milieu du rond (côté droit, x≈290, y≈840) */}
          <Convertible x={108} y={840} rotation={270}/>

          {/* Voiture bleue — entre étape 3 et 4 */}
          <Car x={420} y={1148} rotation={10} flipX={true} bodyColor="#6FA8C0" roofColor="#5A90A8" bumperColor="#4A7890"/>

          {/* Cards d'étape */}
          {!hideStepCards && PINS.map((pin, i) => (
            <StepCard
              key={i} step={STEPS[i]} x={pin.x} y={pin.y} align={cardAligns[i]}
              cardYOffset={i === 0 ? -60 : 0}
            />
          ))}

          {/* Icônes étapes (sans pin) */}
          {PINS.map((pin,i) => (
            <StepCircle key={i} x={pin.x} y={pin.y} color={STEPS[i].color} icon={STEPS[i].icon}/>
          ))}
        </svg>
      </div>
    </section>
  );
}
