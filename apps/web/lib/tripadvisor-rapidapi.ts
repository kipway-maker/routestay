/**
 * tripadvisor-rapidapi.ts
 * Wrapper TripAdvisor via RapidAPI (tripadvisor16)
 *
 * Bugs corrigés après tests API réels :
 * - searchLocation retourne `geoId`, pas `locationId`
 * - searchHotels attend le param `geoId`, pas `locationId`
 * - Les hôtels n'ont pas de lat/lng dans searchHotels → on utilise
 *   les coords du centre-ville comme proxy (position approx. sur la carte)
 * - Photos multiples disponibles dans cardPhotos[]
 */

import { Hotel } from "./amadeus";
import { buildTripAdvisorAffiliateUrl } from "./affiliate";
import { haversineKm } from "./route-utils";

const RAPIDAPI_HOST = "tripadvisor16.p.rapidapi.com";
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

/** Résout le geoId TripAdvisor pour une ville (retourne geoId + nom de ville) */
async function resolveGeoId(
  lat: number,
  lng: number
): Promise<{ geoId: string; cityName: string; cityLat: number; cityLng: number } | null> {
  const cityName = await reverseGeocode(lat, lng);
  if (!cityName) return null;

  const url = `${BASE_URL}/api/v1/hotels/searchLocation?query=${encodeURIComponent(cityName)}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`TripAdvisor searchLocation ${res.status}`);
  const data = await res.json();
  const items: any[] = data?.data ?? [];

  // Cherche France en priorité
  const item = items.find((i: any) =>
    i.secondaryText?.toLowerCase().includes("france")
  ) ?? items[0];

  if (!item?.geoId) return null;

  return {
    geoId:    String(item.geoId),
    cityName: item.title?.replace(/<[^>]+>/g, "") ?? cityName,
    cityLat:  lat,   // coords du point de route utilisé pour la recherche
    cityLng:  lng,
  };
}

async function fetchHotels(
  geoId: string,
  cityLat: number,
  cityLng: number,
  checkIn: string,
  checkOut: string,
  allRoutePoints: Array<{ lat: number; lng: number }>
): Promise<Hotel[]> {
  const params = new URLSearchParams({
    geoId,        // ← correction : TripAdvisor attend "geoId"
    checkIn,
    checkOut,
    adults: "1",
    rooms:  "1",
    currencyCode: "EUR",
  });

  const url = `${BASE_URL}/api/v1/hotels/searchHotels?${params}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`TripAdvisor searchHotels ${res.status}`);
  const data = await res.json();
  const rawHotels: any[] = data?.data?.data ?? [];

  // Trouver le point de route le plus proche du centre-ville
  let minDistCity = Infinity;
  let nearestCityIdx = 0;
  for (let i = 0; i < allRoutePoints.length; i++) {
    const d = haversineKm(cityLat, cityLng, allRoutePoints[i].lat, allRoutePoints[i].lng);
    if (d < minDistCity) { minDistCity = d; nearestCityIdx = i; }
  }

  // Si la ville est trop loin de la route (> 30 km), on skip
  if (minDistCity > 30) return [];

  const hotels: Hotel[] = [];

  for (const h of rawHotels) {
    // TripAdvisor searchHotels ne renvoie pas de lat/lng par hôtel.
    // On utilise les coords du centre-ville comme proxy → hôtels
    // affichés groupés sur la carte autour de la ville.
    const lat = cityLat + (Math.random() - 0.5) * 0.04; // légère dispersion ~2km
    const lng = cityLng + (Math.random() - 0.5) * 0.04;

    const detourKm      = Math.round(minDistCity * 2 * 10) / 10;
    const detourMinutes = Math.round((detourKm / 65) * 60);
    const routePositionPct = Math.round(
      (nearestCityIdx / Math.max(allRoutePoints.length - 1, 1)) * 100
    );

    // Prix : "€162" → 162
    const priceRaw = h.priceForDisplay ?? null;
    const price = priceRaw
      ? parseFloat(String(priceRaw).replace(/[^0-9.]/g, ""))
      : null;

    const rating = h.bubbleRating?.rating ? parseFloat(h.bubbleRating.rating) : null;

    // Photos multiples depuis cardPhotos[]
    const photos: string[] = (h.cardPhotos ?? [])
      .map((p: any) => {
        const tpl = p?.sizes?.urlTemplate;
        if (!tpl) return null;
        return tpl.replace("{width}", "600").replace("{height}", "400");
      })
      .filter(Boolean)
      .slice(0, 6);

    const imageUrl = photos[0]
      ?? "https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop";

    const name: string  = (h.title ?? "Hôtel").replace(/<[^>]+>/g, "");
    const city: string  = h.secondaryInfo ?? "";
    const taUrl: string = h.commerceInfo?.externalUrl ?? "";

    hotels.push({
      id:                  `tripadvisor-${h.id}`,
      name,
      lat,
      lng,
      distanceFromRouteKm: Math.round(minDistCity * 10) / 10,
      detourKm,
      detourMinutes,
      routePositionPct,
      city,
      pricePerNight:       price && !isNaN(price) ? Math.round(price) : null,
      currency:            "EUR",
      rating,
      imageUrl,
      images:              photos.length ? photos : [imageUrl],
      checkinDeadline:     null,
      hasEVCharger:        false,
      accommodationType:   "hotel",
      source:              "tripadvisor" as any,
      bookingUrl:          buildTripAdvisorAffiliateUrl({ name, city, lat, lng, checkIn, checkOut, taUrl }),
      address:             "",
    });
  }

  return hotels;
}

export async function searchHotelsViaTripAdvisor(
  points: Array<{ lat: number; lng: number }>,
  checkIn: string,
  checkOut: string
): Promise<Hotel[]> {
  if (!process.env.RAPIDAPI_KEY) return [];

  // 10 points équidistants sur la route
  const TARGET_SAMPLES = 10;
  const step = Math.max(1, Math.floor(points.length / TARGET_SAMPLES));
  const sampled = points.filter((_, i) => i % step === 0).slice(0, TARGET_SAMPLES);

  // Phase 1 : résolution des geoIds en parallèle
  const resolved = await Promise.allSettled(
    sampled.map((point) => resolveGeoId(point.lat, point.lng))
  );

  // Déduplique les geoId (même ville depuis deux points proches)
  const uniqueGeoIds = new Map<string, { cityLat: number; cityLng: number }>();
  for (const r of resolved) {
    if (r.status === "fulfilled" && r.value) {
      const { geoId, cityLat, cityLng } = r.value;
      if (!uniqueGeoIds.has(geoId)) uniqueGeoIds.set(geoId, { cityLat, cityLng });
    }
  }
  console.log(`[TripAdvisor] ${sampled.length} points → ${uniqueGeoIds.size} villes uniques`);

  // Phase 2 : fetch hôtels pour chaque ville unique
  const allHotels: Hotel[] = [];
  const seen = new Set<string>();

  await Promise.allSettled(
    Array.from(uniqueGeoIds.entries()).map(async ([geoId, { cityLat, cityLng }]) => {
      try {
        const hotels = await fetchHotels(geoId, cityLat, cityLng, checkIn, checkOut, points);
        for (const h of hotels) {
          if (!seen.has(h.id)) { seen.add(h.id); allHotels.push(h); }
        }
      } catch (err) {
        console.warn(`[TripAdvisor] geoId ${geoId} :`, err);
      }
    })
  );

  console.log(`[TripAdvisor] ${allHotels.length} hôtels trouvés`);
  return allHotels;
}
