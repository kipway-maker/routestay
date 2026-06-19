import { NextRequest, NextResponse } from "next/server";
import { searchHotelsViaBooking } from "@/lib/booking-rapidapi";
import { searchHotelsViaTripAdvisor } from "@/lib/tripadvisor-rapidapi";
import { searchHotelsViaHotelsCom } from "@/lib/hotels-rapidapi";
import { searchHotelsViaOverpass } from "@/lib/overpass";
import { getCheckDates } from "@/lib/affiliate";
import { Hotel } from "@/lib/amadeus";
import { haversineKm } from "@/lib/route-utils";

function deduplicateByProximity(hotels: Hotel[]): Hotel[] {
  const THRESHOLD_KM = 0.2;
  const kept: Hotel[] = [];
  for (const hotel of hotels) {
    const twin = kept.find(
      (k) => haversineKm(k.lat, k.lng, hotel.lat, hotel.lng) < THRESHOLD_KM
    );
    if (!twin) { kept.push(hotel); continue; }
    const twinPrice  = twin.pricePerNight;
    const hotelPrice = hotel.pricePerNight;
    if (hotelPrice !== null && (twinPrice === null || hotelPrice < twinPrice)) {
      kept[kept.indexOf(twin)] = hotel;
    }
  }
  return kept;
}

export async function POST(req: NextRequest) {
  const { stopPoint, stopPct = 50, departureDate, sources } = await req.json();

  if (!stopPoint?.lat || !stopPoint?.lng) {
    return NextResponse.json({ error: "stopPoint requis" }, { status: 400 });
  }

  const activeSources: string[] = sources ?? ["hotels_com", "booking", "tripadvisor"];
  const { checkIn, checkOut } = getCheckDates(departureDate ?? null);

  // Les wrappers RapidAPI acceptent points[] — on passe [stopPoint] pour cibler une seule ville
  const singlePoint = [stopPoint];
  const tasks: Promise<Hotel[]>[] = [];

  if (process.env.RAPIDAPI_KEY) {
    if (activeSources.includes("hotels_com"))
      tasks.push(searchHotelsViaHotelsCom(singlePoint, checkIn, checkOut).catch((e) => { console.error("[HotelsCom]", e); return []; }));
    if (activeSources.includes("booking"))
      tasks.push(searchHotelsViaBooking(singlePoint, checkIn, checkOut).catch((e) => { console.error("[Booking]", e); return []; }));
    if (activeSources.includes("tripadvisor"))
      tasks.push(searchHotelsViaTripAdvisor(singlePoint, checkIn, checkOut).catch((e) => { console.error("[TripAdvisor]", e); return []; }));
  }

  // OSM — pas un site de réservation, prix/photos non disponibles
  // tasks.push(searchHotelsViaOverpass(stopPoint, 25).catch((e) => { console.error("[OSM]", e); return []; }));

  const results = await Promise.all(tasks);
  const allHotels: Hotel[] = [];
  results.forEach((r) => allHotels.push(...r));

  // Aligne routePositionPct sur le stopPct réel de l'user
  const withPct = allHotels.map((h) => ({ ...h, routePositionPct: Math.round(stopPct) }));

  const deduplicated = deduplicateByProximity(withPct);
  console.log(`[Hotels] stopPct=${stopPct}% → ${allHotels.length} bruts → ${deduplicated.length} après dédup`);

  return NextResponse.json(deduplicated);
}
