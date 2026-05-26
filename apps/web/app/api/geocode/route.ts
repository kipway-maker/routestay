import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.length < 3) return NextResponse.json([]);

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1&accept-language=fr`;
  const res = await fetch(url, { headers: { "User-Agent": "RouteStay/1.0" } });
  const data = await res.json();

  return NextResponse.json(
    data.map((item: any) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }))
  );
}
