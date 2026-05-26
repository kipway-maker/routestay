import { NextRequest, NextResponse } from "next/server";
import { sampleRoutePoints } from "@/lib/route-utils";

export async function POST(req: NextRequest) {
  const { origin, destination } = await req.json();

  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes?.[0]) {
    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  }

  const route = data.routes[0];
  const geometry = route.geometry; // GeoJSON LineString
  const waypoints = sampleRoutePoints(geometry, 50); // every 50km

  return NextResponse.json({
    geometry,
    distance: route.distance,
    duration: route.duration,
    waypoints,
  });
}
