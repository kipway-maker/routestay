import { NextRequest, NextResponse } from "next/server";
import { searchHotelsAlongRoute } from "@/lib/amadeus";

export async function POST(req: NextRequest) {
  const { points } = await req.json();
  const hotels = await searchHotelsAlongRoute(points);
  return NextResponse.json(hotels);
}
