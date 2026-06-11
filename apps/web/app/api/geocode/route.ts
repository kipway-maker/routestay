import { NextRequest, NextResponse } from "next/server";

const TYPE_LABEL: Record<string, string> = {
  municipality:             "Ville",
  municipal_district:       "Ville",
  locality:                 "Lieu",
  neighbourhood:            "Quartier",
  place:                    "Lieu",
  county:                   "Département",
  subregion:                "Sous-région",
  region:                   "Région",
  address:                  "Adresse",
  road:                     "Rue",
  poi:                      "Point d'intérêt",
  joint_municipality:       "Commune",
  joint_submunicipality:    "Commune",
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const key = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  if (!key) return NextResponse.json([]);

  // Détecte si la query ressemble à une adresse (contient mot de voie)
  const VOIE = /\b(rue|avenue|av\.|boulevard|bd|allée|chemin|impasse|place|route|passage|square|cité|villa|hameau|lieu[- ]dit)\b/i;
  const isAddress = VOIE.test(q);

  const types = isAddress
    // Requête adresse : prioriser rues + adresses, garder les villes pour fallback
    ? "address,road,municipality,municipal_district,locality,neighbourhood,place"
    // Requête ville : villes, communes, départements, régions
    : "municipality,municipal_district,joint_municipality,joint_submunicipality,locality,county,subregion,region,place";

  const url = [
    `https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json`,
    `?key=${key}`,
    `&language=fr`,
    `&limit=8`,
    `&types=${types}`,
    // Biais vers la France (centre ~2.3,46.5) sans restreindre à la France
    `&proximity=2.3,46.5`,
  ].join("");

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();

    const seen = new Set<string>();

    const results = (data.features ?? [])
      .map((f: any) => {
        const name: string = f.text_fr ?? f.text ?? f.properties?.name ?? "";
        const ctx: any[] = f.context ?? [];
        const type = (f.place_type ?? [])[0] ?? "place";

        // Extraire ville + département depuis le tableau context structuré
        const city = ctx.find((c: any) =>
          c.id?.startsWith("municipality.") ||
          c.id?.startsWith("municipal_district.") ||
          c.id?.startsWith("locality.")
        )?.text_fr;

        const dept = ctx.find((c: any) =>
          c.id?.startsWith("county.")
        )?.text_fr;

        // Pays pour le tri
        const countryCode: string =
          ctx.find((c: any) => c.id?.startsWith("country."))?.country_code ?? "xx";

        // Pour les villes/communes, le contexte utile est le département
        const isCity = type === "municipality" || type === "municipal_district" ||
                       type === "joint_municipality" || type === "locality";
        const subtitle = isCity
          ? [dept].filter(p => p && p !== name).join(", ")
          : [city, dept].filter(p => p && p !== name).join(", ");

        return {
          name,
          subtitle,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          type: TYPE_LABEL[type] ?? "Lieu",
          _cc: countryCode, // pour le tri, retiré avant retour
        };
      })
      // Dédupliquer par nom identique
      .filter((item: any) => {
        const key = item.name.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      // France + pays européens proches en tête
      .sort((a: any, b: any) => {
        const PRIO: Record<string, number> = { fr: 0, be: 1, ch: 2, lu: 3, mc: 3, es: 4, it: 4, de: 4, nl: 5 };
        const av = PRIO[a._cc] ?? 99;
        const bv = PRIO[b._cc] ?? 99;
        return av - bv;
      })
      // Retirer le champ interne _cc avant de renvoyer
      .map(({ _cc: _, ...rest }: any) => rest)
      .slice(0, 6);

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
