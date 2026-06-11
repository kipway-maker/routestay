/**
 * hotels-rapidapi.ts
 * Wrapper Hotels.com via RapidAPI (hotels4 — apidojo)
 *
 * Clé requise : RAPIDAPI_KEY dans .env.local
 * Abonnement  : https://rapidapi.com/apidojo/api/hotels4 (Basic gratuit : 10 req/s)
 *
 * Flow :
 *   1. /locations/search  → récupère le destinationId depuis lat/lng
 *   2. /properties/list   → liste des hôtels avec prix, note, image principale
 *   3. On enrichit chaque hôtel avec le deeplink CJ Hotels.com
 */

import { Hotel } from "./amadeus";
import { buildHotelsAffiliateUrl, getCheckDates } from "./affiliate";
import { haversineKm } from "./route-utils";

const RAPIDAPI_HOST = "hotels4.p.rapidapi.com";
const BASE_URL = `https://${RAPIDAPI_HOST}`;

function headers() {
  return {
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
    "X-RapidAPI-Host": RAPIDAPI_HOST,
  };
}

// ── 1. Résolution de destination par lat/lng ────────────────────

async function resolveDestinationId(lat: number, lng: number): Promise<string | null> {
  const query = `${lat},${lng}`;
  const url = `${BASE_URL}/locations/search?query=${encodeURIComponent(query)}&locale=fr_FR`;

  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`RapidAPI locations/search ${res.status}`);

  const data = await res.json();
  const suggestions: any[] = data?.suggestions ?? [];

  // Priorité : CITY > NEIGHBORHOOD > GROUP_SAME_NAME
  for (const group of suggestions) {
    for (const entity of group.entities ?? []) {
      if (["CITY", "NEIGHBORHOOD", "POINT_OF_INTEREST"].includes(entity.type)) {
        return entity.destinationId as string;
      }
    }
  }

  // Fallback : premier résultat dispo
  return suggestions[0]?.entities?.[0]?.destinationId ?? null;
}

// ── 2. Liste des hôtels pour un destinationId ───────────────────

async function fetchHotelsForDestination(
  destinationId: string,
  checkIn: string,
  checkOut: string,
  routePoint: { lat: number; lng: number },
  allRoutePoints: Array<{ lat: number; lng: number }>
): Promise<Hotel[]> {
  const params = new URLSearchParams({
    destinationId,
    pageNumber: "1",
    pageSize: "25",
    checkIn,
    checkOut,
    adults1: "1",
    sortOrder: "STAR_RATING_HIGHEST_FIRST",
    locale: "fr_FR",
    currency: "EUR",
  });

  const url = `${BASE_URL}/properties/list?${params}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`RapidAPI properties/list ${res.status}`);

  const data = await res.json();
  const rawHotels: any[] = data?.data?.body?.searchResults?.results ?? [];

  const hotels: Hotel[] = [];

  for (const h of rawHotels) {
    const lat = h.coordinate?.lat;
    const lng = h.coordinate?.lon;
    if (lat == null || lng == null) continue;

    // Distance à la route
    let minDist = Infinity;
    let nearestIdx = 0;
    for (let i = 0; i < allRoutePoints.length; i++) {
      const d = haversineKm(lat, lng, allRoutePoints[i].lat, allRoutePoints[i].lng);
      if (d < minDist) { minDist = d; nearestIdx = i; }
    }
    if (minDist > 15) continue;

    const detourKm      = Math.round(minDist * 2 * 10) / 10;
    const detourMinutes = Math.round((detourKm / 65) * 60);
    const routePositionPct = Math.round((nearestIdx / Math.max(allRoutePoints.length - 1, 1)) * 100);

    // Prix
    const priceRaw = h.ratePlan?.price?.current;
    const price = priceRaw
      ? parseFloat(String(priceRaw).replace(/[^0-9.]/g, ""))
      : null;

    // Note
    const rating = h.starRating ? parseFloat(h.starRating) : (h.guestReviews?.rating ? parseFloat(h.guestReviews.rating) / 2 : null);

    // Image
    const imageUrl: string = h.thumbnailUrl
      ? (h.thumbnailUrl.startsWith("//") ? `https:${h.thumbnailUrl}` : h.thumbnailUrl)
      : "https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop";

    // Ville
    const city: string = h.address?.locality ?? h.address?.countryName ?? "";

    // Type
    const typeRaw: string = (h.type ?? "").toLowerCase();
    let accommodationType: Hotel["accommodationType"] = "hotel";
    if (typeRaw.includes("hostel") || typeRaw.includes("auberge")) accommodationType = "auberge";
    else if (typeRaw.includes("bed") || typeRaw.includes("guest")) accommodationType = "bb";
    else if (typeRaw.includes("camp")) accommodationType = "camping";

    // Lien affilié Hotels.com CJ avec dates
    const bookingUrl = buildHotelsAffiliateUrl({
      name: h.name,
      city,
      lat,
      lng,
      checkIn,
      checkOut,
    });

    hotels.push({
      id:                  `rapidapi-${h.id}`,
      name:                h.name ?? "Hôtel",
      lat,
      lng,
      distanceFromRouteKm: Math.round(minDist * 10) / 10,
      detourKm,
      detourMinutes,
      routePositionPct,
      city,
      pricePerNight:       price,
      currency:            "EUR",
      rating,
      imageUrl,
      images:              [imageUrl],
      checkinDeadline:     null,
      hasEVCharger:        false,
      accommodationType,
      source:              "hotels_com" as const,
      bookingUrl,
      address:             [h.address?.streetAddress, h.address?.locality].filter(Boolean).join(", "),
    });
  }

  return hotels;
}

// ── Export principal ────────────────────────────────────────────

/**
 * Recherche des hôtels le long de la route via RapidAPI Hotels4.
 * Interroge jusqu'à 4 points de la route en parallèle.
 */
export async function searchHotelsViaRapidAPI(
  points: Array<{ lat: number; lng: number }>,
  departureDate?: string | null
): Promise<Hotel[]> {
  if (!process.env.RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY manquante dans .env.local");
  }

  const { checkIn, checkOut } = getCheckDates(departureDate);

  // Échantillon : max 4 points répartis sur la route
  const step = Math.max(1, Math.floor(points.length / 4));
  const sampled = points.filter((_, i) => i % step === 0).slice(0, 4);

  const allHotels: Hotel[] = [];
  const seen = new Set<string>();

  await Promise.allSettled(
    sampled.map(async (point) => {
      try {
        const destId = await resolveDestinationId(point.lat, point.lng);
        if (!destId) return;

        const hotels = await fetchHotelsForDestination(
          destId,
          checkIn,
          checkOut,
          point,
          points
        );

        for (const h of hotels) {
          if (!seen.has(h.id)) {
            seen.add(h.id);
            allHotels.push(h);
          }
        }
      } catch (err) {
        console.warn(`[RapidAPI] point (${point.lat},${point.lng}) échoué :`, err);
      }
    })
  );

  return allHotels;
}
