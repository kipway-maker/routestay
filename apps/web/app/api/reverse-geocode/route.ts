import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");
  if (!lat || !lng) return NextResponse.json({ city: null });

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=fr`;
    const res = await fetch(url, {
      headers: { "User-Agent": "RouteStay/1.0" },
      next: { revalidate: 86400 }, // cache 24h côté serveur
    });
    const data = await res.json();
    const addr = data.address ?? {};
    const city =
      addr.city || addr.town || addr.village || addr.municipality || addr.county || null;
    return NextResponse.json({ city });
  } catch {
    return NextResponse.json({ city: null });
  }
}
