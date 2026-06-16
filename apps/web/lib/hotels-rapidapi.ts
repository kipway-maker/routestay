/**
 * hotels-rapidapi.ts
 * Wrapper Hotels.com via RapidAPI (hotels4 — endpoints v3)
 *
 * Flow :
 *   1. reverseGeocode lat/lng → nom de ville (MapTiler)
 *   2. /locations/v3/search?q=ville → gaiaId (regionId Hotels.com)
 *   3. POST /properties/v3/list  → LodgingCard[] avec nom, prix, photos, URL directe
 *
 * Note : v3/list ne retourne pas de coordonnées par hôtel
 *        → on utilise le centre-ville + offset ±2km comme proxy (idem TripAdvisor)
 */

import { Hotel } from "./amadeus";
import { haversineKm } from "./route-utils";

const RAPIDAPI_HOST = "hotels4.p.rapidapi.com";
const BASE_URL = `https://${RAPIDAPI_HOST}`;

function headers() {
  return {
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
    "X-RapidAPI-Host": RAPIDAPI_HOST,
  };
}

/** Reverse geocode lat/lng → nom de ville via MapTiler */
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const key = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  if (!key) return null;
  const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${key}&language=fr&types=municipality,locality`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const feature = data?.features?.[0];
  return feature?.text_fr ?? feature?.text ?? null;
}

/** Résout le gaiaId Hotels.com pour une ville */
async function resolveGaiaId(
  lat: number,
  lng: number
): Promise<{ gaiaId: string; cityName: string; cityLat: number; cityLng: number } | null> {
  const cityName = await reverseGeocode(lat, lng);
  if (!cityName) return null;

  const url = `${BASE_URL}/locations/v3/search?q=${encodeURIComponent(cityName + " France")}&locale=fr_FR&langid=1036&siteid=300000001`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`Hotels4 locations/v3/search ${res.status}`);
  const data = await res.json();

  const suggestions: any[] = data?.sr ?? [];
  // Priorité : résultat avec "France" dans le nom complet
  const item = suggestions.find((s: any) =>
    s.regionNames?.fullName?.toLowerCase().includes("france")
  ) ?? suggestions[0];

  if (!item?.gaiaId) return null;

  return {
    gaiaId:   String(item.gaiaId),
    cityName: item.regionNames?.shortName ?? cityName,
    cityLat:  lat,
    cityLng:  lng,
  };
}

/** Fetch hôtels pour un gaiaId (regionId) */
async function fetchHotels(
  gaiaId: string,
  cityLat: number,
  cityLng: number,
  checkIn: string,   // "YYYY-MM-DD"
  checkOut: string,
  allRoutePoints: Array<{ lat: number; lng: number }>
): Promise<Hotel[]> {
  const [ciY, ciM, ciD] = checkIn.split("-").map(Number);
  const [coY, coM, coD] = checkOut.split("-").map(Number);

  const body = {
    currency: "EUR",
    eapid: 1,
    locale: "fr_FR",
    siteId: 300000001,
    destination: { regionId: gaiaId },
    checkInDate:  { day: ciD, month: ciM, year: ciY },
    checkOutDate: { day: coD, month: coM, year: coY },
    rooms: [{ adults: 1 }],
    resultsStartingIndex: 0,
    resultsSize: 25,
    sort: "PRICE_LOW_TO_HIGH",
  };

  const res = await fetch(`${BASE_URL}/properties/v3/list`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Hotels4 properties/v3/list ${res.status}`);
  const data = await res.json();

  const listings: any[] = data?.data?.propertySearch?.propertySearchListings ?? [];

  // Trouver le point de route le plus proche du centre-ville
  let minDistCity = Infinity;
  let nearestCityIdx = 0;
  for (let i = 0; i < allRoutePoints.length; i++) {
    const d = haversineKm(cityLat, cityLng, allRoutePoints[i].lat, allRoutePoints[i].lng);
    if (d < minDistCity) { minDistCity = d; nearestCityIdx = i; }
  }
  if (minDistCity > 30) return []; // ville trop loin de la route

  const hotels: Hotel[] = [];

  for (const item of listings) {
    if (item.__typename !== "LodgingCard") continue;
    if (!item.headingSection) continue;

    const name: string = (item.headingSection.heading ?? "Hôtel").trim();

    // Prix : cherche DisplayPrice LEAD
    let price: number | null = null;
    try {
      for (const line of item.priceSection?.priceSummary?.displayMessages ?? []) {
        for (const li of line.lineItems ?? []) {
          if (li.__typename === "DisplayPrice" && li.role === "LEAD") {
            const raw = li.price?.formatted ?? "";
            const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
            if (!isNaN(num)) price = Math.round(num);
            break;
          }
        }
        if (price !== null) break;
      }
    } catch { /* ignore */ }

    // Photos
    const photos: string[] = (item.mediaSection?.gallery?.media ?? [])
      .map((m: any) => m?.media?.url)
      .filter(Boolean)
      .slice(0, 6);

    const imageUrl = photos[0]
      ?? "https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop";

    // URL directe Hotels.com avec dates déjà incluses
    const directUrl: string = item.cardLink?.resource?.value ?? "";

    // Coordonnées : centre-ville + légère dispersion ~2km (pas de coords par hôtel en v3)
    const lat = cityLat + (Math.random() - 0.5) * 0.04;
    const lng = cityLng + (Math.random() - 0.5) * 0.04;

    const detourKm       = Math.round(minDistCity * 2 * 10) / 10;
    const detourMinutes  = Math.round((detourKm / 65) * 60);
    const routePositionPct = Math.round(
      (nearestCityIdx / Math.max(allRoutePoints.length - 1, 1)) * 100
    );

    hotels.push({
      id:                  `hotelscom-${item.id}`,
      name,
      lat,
      lng,
      distanceFromRouteKm: Math.round(minDistCity * 10) / 10,
      detourKm,
      detourMinutes,
      routePositionPct,
      city:                "",
      pricePerNight:       price,
      currency:            "EUR",
      rating:              null,  // v3/list ne retourne pas de note guest
      imageUrl,
      images:              photos.length >= 2 ? photos : [
        imageUrl,
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop",
      ],
      checkinDeadline:     null,
      hasEVCharger:        false,
      accommodationType:   "hotel",
      source:              "hotels_com" as any,
      bookingUrl:          directUrl,  // URL Hotels.com directe avec dates
      address:             "",
    });
  }

  return hotels;
}

/** Point d'entrée principal */
export async function searchHotelsViaHotelsCom(
  points: Array<{ lat: number; lng: number }>,
  checkIn: string,
  checkOut: string
): Promise<Hotel[]> {
  if (!process.env.RAPIDAPI_KEY) return [];

  // 10 points équidistants sur la route
  const TARGET_SAMPLES = 10;
  const step = Math.max(1, Math.floor(points.length / TARGET_SAMPLES));
  const sampled = points.filter((_, i) => i % step === 0).slice(0, TARGET_SAMPLES);

  // Phase 1 : résolution des gaiaIds en parallèle
  const resolved = await Promise.allSettled(
    sampled.map((point) => resolveGaiaId(point.lat, point.lng))
  );

  // Déduplique les gaiaId (même ville depuis deux points proches)
  const uniqueGaiaIds = new Map<string, { cityLat: number; cityLng: number }>();
  for (const r of resolved) {
    if (r.status === "fulfilled" && r.value) {
      const { gaiaId, cityLat, cityLng } = r.value;
      if (!uniqueGaiaIds.has(gaiaId)) uniqueGaiaIds.set(gaiaId, { cityLat, cityLng });
    }
  }
  console.log(`[HotelsCom] ${sampled.length} points → ${uniqueGaiaIds.size} villes uniques`);

  // Phase 2 : fetch hôtels pour chaque ville
  const allHotels: Hotel[] = [];
  const seen = new Set<string>();

  await Promise.allSettled(
    Array.from(uniqueGaiaIds.entries()).map(async ([gaiaId, { cityLat, cityLng }]) => {
      try {
        const hotels = await fetchHotels(gaiaId, cityLat, cityLng, checkIn, checkOut, points);
        for (const h of hotels) {
          if (!seen.has(h.id)) { seen.add(h.id); allHotels.push(h); }
        }
      } catch (err) {
        console.warn(`[HotelsCom] gaiaId ${gaiaId} :`, err);
      }
    })
  );

  console.log(`[HotelsCom] ${allHotels.length} hôtels trouvés`);
  return allHotels;
}
