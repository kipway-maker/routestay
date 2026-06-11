import { NextRequest, NextResponse } from "next/server";
import { searchHotelsViaBooking } from "@/lib/booking-rapidapi";
import { searchHotelsViaTripAdvisor } from "@/lib/tripadvisor-rapidapi";
import { searchHotelsViaHotelsCom } from "@/lib/hotels-rapidapi";
import { searchHotelsViaOverpass } from "@/lib/overpass";
// searchHotelsAlongRoute (mock) supprimé — coordonnées fictives trop trompeuses
import { getCheckDates } from "@/lib/affiliate";
import { Hotel } from "@/lib/amadeus";
import { haversineKm } from "@/lib/route-utils";

/**
 * Déduplication par proximité GPS :
 * Si deux hôtels sont à moins de 200m, c'est le même.
 * On garde le moins cher (ou celui avec un prix si l'autre n'en a pas).
 */
function deduplicateByProximity(hotels: Hotel[]): Hotel[] {
  const THRESHOLD_KM = 0.2;
  const kept: Hotel[] = [];

  for (const hotel of hotels) {
    const twin = kept.find(
      (k) => haversineKm(k.lat, k.lng, hotel.lat, hotel.lng) < THRESHOLD_KM
    );

    if (!twin) {
      kept.push(hotel);
      continue;
    }

    // Même hôtel — on garde le moins cher
    const twinPrice  = twin.pricePerNight;
    const hotelPrice = hotel.pricePerNight;

    if (hotelPrice !== null && (twinPrice === null || hotelPrice < twinPrice)) {
      const idx = kept.indexOf(twin);
      kept[idx] = hotel; // remplace par le moins cher
    }
  }

  return kept;
}

export async function POST(req: NextRequest) {
  const { points, departureDate, sources } = await req.json();
  // sources = ["hotels_com", "booking", "tripadvisor"] ou sous-ensemble (filtre UI)
  // hotels_com retiré du défaut (Hotels4 API cassée, pas de vraies données)
  const activeSources: string[] = sources ?? ["booking", "tripadvisor"];

  const { checkIn, checkOut } = getCheckDates(departureDate ?? null);

  const allHotels: Hotel[] = [];

  // ── 3 sources en parallèle ──────────────────────────────────
  const tasks: Promise<Hotel[]>[] = [];

  if (process.env.RAPIDAPI_KEY) {
    // Hotels.com via Hotels4 API v3 (endpoints v3 fonctionnels)
    if (activeSources.includes("hotels_com")) {
      tasks.push(
        searchHotelsViaHotelsCom(points, checkIn, checkOut)
          .catch((e) => { console.error("[HotelsCom]", e); return []; })
      );
    }

    if (activeSources.includes("booking")) {
      tasks.push(
        searchHotelsViaBooking(points, checkIn, checkOut)
          .catch((e) => { console.error("[Booking]", e); return []; })
      );
    }
    if (activeSources.includes("tripadvisor")) {
      tasks.push(
        searchHotelsViaTripAdvisor(points, checkIn, checkOut)
          .catch((e) => { console.error("[TripAdvisor]", e); return []; })
      );
    }
  }

  const results = await Promise.all(tasks);
  results.forEach((r) => allHotels.push(...r));

  // ── Fallback OSM si les APIs RapidAPI ne renvoient rien ──────
  // (quota épuisé, erreur réseau, etc.)
  // OSM retourne de vraies données géolocalisées → coordonnées fiables
  if (allHotels.length < 3) {
    console.warn(`[Hotels] APIs RapidAPI: ${allHotels.length} résultats — fallback OSM`);
    const osm = await searchHotelsViaOverpass(points).catch(() => []);
    allHotels.push(...osm);
  }

  // ── PAS de fallback mock ──────────────────────────────────────
  // Le mock génère des coordonnées aléatoires autour des points de route
  // avec des villes fictives → hôtels affichés au mauvais endroit sur la carte.
  // On préfère renvoyer une liste vide (état "aucun résultat") plutôt que
  // des données fausses qui trompent l'utilisateur.

  const deduplicated = deduplicateByProximity(allHotels);
  console.log(`[Hotels] ${allHotels.length} bruts → ${deduplicated.length} après dédup`);

  return NextResponse.json(deduplicated);
}
