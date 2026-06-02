import { NextRequest, NextResponse } from "next/server";
import { searchHotelsViaOverpass } from "@/lib/overpass";
import { searchHotelsAlongRoute } from "@/lib/amadeus";

export async function POST(req: NextRequest) {
  const { points } = await req.json();

  // 1. Tente Overpass — vraies données OSM, gratuites, sans clé API
  const overpassHotels = await searchHotelsViaOverpass(points);
  if (overpassHotels.length >= 3) {
    return NextResponse.json(overpassHotels);
  }

  // 2. Fallback mock si Overpass renvoie trop peu de résultats
  console.warn(`[Hotels] Overpass: ${overpassHotels.length} résultats — fallback mock`);
  const mockHotels = await searchHotelsAlongRoute(points);
  return NextResponse.json(mockHotels);
}
