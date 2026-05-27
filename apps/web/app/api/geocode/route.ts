import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) return NextResponse.json([]);

  // Fetch more results than needed so deduplication still leaves enough
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=12&addressdetails=1&accept-language=fr&countrycodes=fr`;
  const res = await fetch(url, { headers: { "User-Agent": "KipWay/1.0" } });
  const data = await res.json();

  const seen = new Set<string>();

  const results = data
    .map((item: any) => {
      const a = item.address ?? {};
      const type = item.type ?? item.class ?? "";

      // ── Rue / adresse ──────────────────────────────────────
      const hasRoad = !!(a.road ?? a.pedestrian ?? a.footway ?? a.path);
      if (hasRoad) {
        const road = a.road ?? a.pedestrian ?? a.footway ?? a.path ?? "";
        const houseNum = a.house_number ? `${a.house_number} ` : "";
        const city = a.city ?? a.town ?? a.village ?? a.municipality ?? "";
        const dept = a.county ?? a.state_district ?? "";
        const sub = [city, dept].filter(Boolean).join(", ");
        return {
          name: sub ? `${houseNum}${road}, ${sub}` : `${houseNum}${road}`,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          _type: "address",
        };
      }

      // ── Ville / commune ───────────────────────────────────
      const city = a.city ?? a.town ?? a.village ?? a.municipality ?? a.hamlet ?? item.name;
      const dept = a.county ?? a.state_district ?? "";
      // For city-level results, only show dept (not the full region) to keep it short and distinct
      const sub = dept || (a.state ?? "");
      return {
        name: sub ? `${city}, ${sub}` : city,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        _type: type,
      };
    })
    // Deduplicate: same name → keep only first occurrence
    .filter((item: any) => {
      const key = item.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    // Remove internal _type field before returning
    .map(({ _type: _, ...rest }: any) => rest)
    .slice(0, 6);

  return NextResponse.json(results);
}
