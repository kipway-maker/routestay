/**
 * booking-rapidapi.ts
 * Wrapper Booking.com via RapidAPI (booking-com15)
 */

import { Hotel } from "./amadeus";
import { buildBookingAffiliateUrl } from "./affiliate";
import { haversineKm } from "./route-utils";

const RAPIDAPI_HOST = "booking-com15.p.rapidapi.com";
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

async function resolveDestinationId(lat: number, lng: number): Promise<string | null> {
  // 1. Reverse geocode → nom de ville
  const cityName = await reverseGeocode(lat, lng);
  if (!cityName) return null;

  // 2. Cherche le dest_id Booking avec le nom de ville
  const url = `${BASE_URL}/api/v1/hotels/searchDestination?query=${encodeURIComponent(cityName + " France")}&languagecode=fr`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`Booking locations ${res.status}`);
  const data = await res.json();
  const items: any[] = data?.data ?? [];
  const city = items.find((i: any) => i.dest_type === "city" || i.search_type === "city");
  return (city ?? items[0])?.dest_id ?? null;
}

async function fetchHotels(
  destId: string,
  checkIn: string,
  checkOut: string,
  allRoutePoints: Array<{ lat: number; lng: number }>
): Promise<Hotel[]> {
  // Fetch page 1 + page 2 en parallèle pour plus de résultats
  const makeParams = (page: number) => new URLSearchParams({
    dest_id: destId,
    search_type: "city",
    arrival_date: checkIn,
    departure_date: checkOut,
    adults: "1",
    room_qty: "1",
    page_number: String(page),
    languagecode: "fr",
    currency_code: "EUR",
  });

  const [res1, res2] = await Promise.all([
    fetch(`${BASE_URL}/api/v1/hotels/searchHotels?${makeParams(1)}`, { headers: headers() }),
    fetch(`${BASE_URL}/api/v1/hotels/searchHotels?${makeParams(2)}`, { headers: headers() }),
  ]);

  const [data1, data2] = await Promise.all([
    res1.ok ? res1.json() : Promise.resolve({}),
    res2.ok ? res2.json() : Promise.resolve({}),
  ]);

  const rawHotels: any[] = [
    ...(data1?.data?.hotels ?? []),
    ...(data2?.data?.hotels ?? []),
  ];

  const hotels: Hotel[] = [];

  for (const h of rawHotels) {
    const lat = h.property?.latitude;
    const lng = h.property?.longitude;
    if (lat == null || lng == null) continue;

    let minDist = Infinity;
    let nearestIdx = 0;
    for (let i = 0; i < allRoutePoints.length; i++) {
      const d = haversineKm(lat, lng, allRoutePoints[i].lat, allRoutePoints[i].lng);
      if (d < minDist) { minDist = d; nearestIdx = i; }
    }
    if (minDist > 30) continue;  // rayon élargi à 30 km

    const detourKm      = Math.round(minDist * 2 * 10) / 10;
    const detourMinutes = Math.round((detourKm / 65) * 60);
    const routePositionPct = Math.round((nearestIdx / Math.max(allRoutePoints.length - 1, 1)) * 100);

    const price = h.property?.priceBreakdown?.grossPrice?.value ?? null;
    const rating = h.property?.reviewScore ? parseFloat(h.property.reviewScore) / 2 : null;

    const imgRaw = h.property?.photoUrls?.[0] ?? h.property?.mainPhoto ?? null;
    const imageUrl = imgRaw
      ? (imgRaw.startsWith("//") ? `https:${imgRaw}` : imgRaw)
      : "https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop";

    // wishlistName = nom de la ville (ex: "Lyon") — confirmé sur la vraie API
    const city: string = h.property?.wishlistName ?? "";
    const name: string = h.property?.name ?? "Hôtel";

    hotels.push({
      id:                  `booking-${h.hotel_id ?? h.property?.id}`,
      name,
      lat,
      lng,
      distanceFromRouteKm: Math.round(minDist * 10) / 10,
      detourKm,
      detourMinutes,
      routePositionPct,
      city,
      pricePerNight:       price ? Math.round(price) : null,
      currency:            "EUR",
      rating,
      imageUrl,
      images:              [imageUrl],
      checkinDeadline:     null,   // Booking ne fournit pas cet info via cette API
      hasEVCharger:        false,  // Non disponible
      accommodationType:   "hotel",
      source:              "booking" as any,
      bookingUrl:          buildBookingAffiliateUrl({ name, city, lat, lng, checkIn, checkOut }),
      address:             h.property?.address ?? "",
    });
  }

  return hotels;
}

export async function searchHotelsViaBooking(
  points: Array<{ lat: number; lng: number }>,
  checkIn: string,
  checkOut: string
): Promise<Hotel[]> {
  if (!process.env.RAPIDAPI_KEY) return [];

  // Échantillonne ~10 points équidistants sur la route
  const TARGET_SAMPLES = 10;
  const step = Math.max(1, Math.floor(points.length / TARGET_SAMPLES));
  const sampled = points.filter((_, i) => i % step === 0).slice(0, TARGET_SAMPLES);

  // Phase 1 : résolution des dest_id en parallèle
  const resolved = await Promise.allSettled(
    sampled.map(async (point) => {
      const destId = await resolveDestinationId(point.lat, point.lng);
      return destId ? { destId, point } : null;
    })
  );

  // Déduplique les dest_id (même ville depuis deux points proches)
  const uniqueDestIds = new Map<string, typeof sampled[0]>();
  for (const r of resolved) {
    if (r.status === "fulfilled" && r.value) {
      const { destId, point } = r.value;
      if (!uniqueDestIds.has(destId)) uniqueDestIds.set(destId, point);
    }
  }
  console.log(`[Booking] ${sampled.length} points → ${uniqueDestIds.size} villes uniques`);

  // Phase 2 : fetch hôtels pour chaque ville unique (en parallèle)
  const allHotels: Hotel[] = [];
  const seenHotelId = new Set<string>();

  await Promise.allSettled(
    Array.from(uniqueDestIds.keys()).map(async (destId) => {
      try {
        const hotels = await fetchHotels(destId, checkIn, checkOut, points);
        for (const h of hotels) {
          if (!seenHotelId.has(h.id)) { seenHotelId.add(h.id); allHotels.push(h); }
        }
      } catch (err) {
        console.warn(`[Booking] dest_id ${destId} :`, err);
      }
    })
  );

  console.log(`[Booking] ${allHotels.length} hôtels trouvés`);
  return allHotels;
}
