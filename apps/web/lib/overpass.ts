/**
 * Overpass (OpenStreetMap) — données hôtels réelles
 *
 * Ce que OSM fournit : nom, adresse, ville, coordonnées, type, étoiles, borne EV, check-in
 * Ce qu'on complète : prix (mock cohérent), photos (Unsplash par type), détour (haversine)
 */

import { Hotel } from "./amadeus";
import { haversineKm } from "./route-utils";
import { buildBookingAffiliateUrl } from "./affiliate";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// ── Helpers pour données non disponibles dans OSM ────────────────

// Prix mock déterministes par ID OSM (cohérent entre rendus)
const PRICE_BRACKETS = [49, 59, 69, 79, 89, 99, 109, 119, 129, 145, 159, 179, 199];
function mockPrice(id: number): number {
  return PRICE_BRACKETS[id % PRICE_BRACKETS.length];
}

// Note mock déterministe (entre 3.4 et 4.9)
function mockRating(id: number): number {
  const base = [4.2, 3.8, 4.5, 4.0, 3.6, 4.7, 4.1, 3.9, 4.4, 4.3, 4.8, 3.7, 4.6];
  return base[id % base.length];
}

// Check-in mock
const MOCK_CHECKINS: (string | null)[] = [
  "22:00", "23:00", null, "23:30", "22:00", "00:00", null, "21:00", "23:00", "22:30",
];
function mockCheckin(id: number): string | null {
  return MOCK_CHECKINS[id % MOCK_CHECKINS.length];
}

// Photos par type (Unsplash, libres de droits)
const PHOTOS: Record<Hotel["accommodationType"], string[]> = {
  hotel: [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1551882547-ff40c599fb2e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1564501049412-61c2a01f61d4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=600&h=400&fit=crop",
  ],
  bb: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1595877244574-e90ce41ce089?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1536437075651-01d675529a6b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1469022563428-aa54fde49c92?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop",
  ],
  auberge: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1529408686214-b48b8532f72c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1601701119533-fde08f62a0c6?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1565073624497-7144969e0a98?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?w=600&h=400&fit=crop",
  ],
  camping: [
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1496545672447-f699b503d270?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1533575770077-052fa2c609fc?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1525811902-f2342640856e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1544980919-e17526d4ed0a?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=600&h=400&fit=crop",
  ],
};

function osmTypeToAccomType(tourism: string): Hotel["accommodationType"] {
  if (tourism === "hostel")                                  return "auberge";
  if (tourism === "camp_site" || tourism === "caravan_site") return "camping";
  if (tourism === "guest_house" || tourism === "apartment")  return "bb";
  return "hotel";
}

/**
 * Normalise les horaires de check-in OSM vers "HH:MM" ou null (=24h).
 * OSM peut retourner : "14:00", "14:00-22:00", "24 hours", "anytime", etc.
 */
function parseCheckin(raw: string | undefined, is24h: boolean): string | null {
  if (is24h) return null;
  if (!raw) return null;
  if (/24|anytime|always/i.test(raw)) return null;

  // "14:00-22:00" → prend la fin (heure limite)
  const range = raw.match(/\d{1,2}[:\s]\d{2}\s*[-–]\s*(\d{1,2}[:\s]\d{2})/);
  const target = range ? range[1] : raw;
  const match = target.match(/(\d{1,2})[:\s](\d{2})/);
  if (!match) return null;
  const h = parseInt(match[1]), m = parseInt(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ── Requête Overpass ─────────────────────────────────────────────

export async function searchHotelsViaOverpass(
  stopPoint: { lat: number; lng: number },
  radiusKm: number = 25
): Promise<Hotel[]> {
  const radiusM = radiusKm * 1000;
  const tourismTypes = "hotel|hostel|motel|guest_house|apartment|camp_site";
  const { lat, lng } = stopPoint;

  const query = `[out:json][timeout:60];
(
  node["tourism"~"${tourismTypes}"]["name"](around:${radiusM},${lat},${lng});
  way["tourism"~"${tourismTypes}"]["name"](around:${radiusM},${lat},${lng});
);
out center tags;`;

  let data: { elements: OsmElement[] };
  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "KipWay/1.0 (road-trip hotel finder; contact@kipway.fr)",
      },
      next: { revalidate: 3600 }, // cache 1h côté Next.js
    });
    if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error("[Overpass] requête échouée, fallback mock →", err);
    return []; // Le caller peut fallback sur mock
  }

  const seen = new Set<number>();
  const hotels: Hotel[] = [];

  for (const el of data.elements) {
    if (seen.has(el.id)) continue;
    seen.add(el.id);

    // Coordonnées (node = lat/lon direct, way = center)
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) continue;

    const tags = el.tags ?? {};
    const name = tags.name?.trim();
    if (!name) continue;

    // ── Distance au point d'étape ─────────────────────────────────
    const distToStop = haversineKm(lat, lon, stopPoint.lat, stopPoint.lng);
    if (distToStop > radiusKm) continue;

    const detourKm      = Math.round(distToStop * 2 * 10) / 10;
    const detourMinutes = Math.round((detourKm / 65) * 60);
    const routePositionPct = 50; // sera overridé par stopPct dans route.ts

    // ── Champs OSM ────────────────────────────────────────────────
    const accommodationType = osmTypeToAccomType(tags.tourism ?? "hotel");

    const is24h =
      tags.reception_24h === "yes" ||
      tags["opening_hours"] === "24/7" ||
      /24|always/i.test(tags["opening_hours"] ?? "");

    const checkinDeadline = parseCheckin(tags.check_in, is24h); // null = pas d'info OSM

    const hasEVCharger =
      tags["motorcar:charging"] === "yes" ||
      tags["electric_vehicle_charging"] === "yes" ||
      tags["amenity"] === "charging_station";

    // Étoiles OSM → note sur 5 (ex: "3" → 3.8 pour ne pas pénaliser les non-notés)
    const starsRaw = tags.stars ? parseFloat(tags.stars) : null;
    const rating = starsRaw != null && starsRaw > 0
      ? Math.min(5, Math.round(starsRaw * 10 + 10) / 10) // 3 étoiles → ~4.0
      : null; // pas de note OSM disponible

    const city =
      tags["addr:city"] ??
      tags["addr:town"] ??
      tags["addr:village"] ??
      tags["addr:hamlet"] ??
      "";

    const MOCK_STREETS = [
      "12 rue de la République", "3 avenue Jean Jaurès", "47 boulevard Victor Hugo",
      "8 rue du Général de Gaulle", "21 place de la Mairie", "15 rue des Alpes",
      "6 avenue de la Gare", "33 rue Nationale", "2 place Bellecour", "18 rue du Commerce",
    ];
    const addressFromOsm = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
    const address = addressFromOsm || undefined; // pas d'adresse OSM → on n'invente pas

    // ── Photos ────────────────────────────────────────────────────
    const imgs = PHOTOS[accommodationType];
    const imgBase = el.id % imgs.length;
    const images = Array.from({ length: Math.min(10, imgs.length) }, (_, k) => imgs[(imgBase + k) % imgs.length]);

    hotels.push({
      id:                 `osm-${el.id}`,
      name,
      lat,
      lng:                lon,
      distanceFromRouteKm: Math.round(distToStop * 10) / 10,
      detourKm,
      detourMinutes,
      routePositionPct,
      city,
      pricePerNight:      null, // prix non disponible via OSM
      currency:           "EUR",
      rating,
      imageUrl:           images[0],
      images,
      checkinDeadline,
      hasEVCharger,
      accommodationType,
      source:             "osm" as const,
      // Booking.com trouve l'hôtel exact par nom+ville (redirect direct sur la fiche)
      // Hotels.com redirige vers homepage → moins bon pour l'UX
      bookingUrl:         buildBookingAffiliateUrl({ name, city, lat, lng: lon }),
    });
  }

  return hotels;
}


// ── Types OSM bruts ───────────────────────────────────────────────
interface OsmElement {
  id:      number;
  type:    "node" | "way" | "relation";
  lat?:    number;
  lon?:    number;
  center?: { lat: number; lon: number };
  tags?:   Record<string, string>;
}
