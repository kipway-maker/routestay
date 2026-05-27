import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) return NextResponse.json([]);

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1&accept-language=fr&countrycodes=fr`;
  const res = await fetch(url, { headers: { "User-Agent": "KipWay/1.0" } });
  const data = await res.json();

  return NextResponse.json(
    data.map((item: any) => {
      const a = item.address ?? {};
      const city = a.city ?? a.town ?? a.village ?? a.municipality ?? a.hamlet ?? item.name;
      const dept = a.county ?? a.state_district ?? "";
      const region = a.state ?? "";
      const sub = [dept, region].filter(Boolean).slice(0, 2).join(", ");
      return {
        name: sub ? `${city}, ${sub}` : city,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      };
    })
  );
}
