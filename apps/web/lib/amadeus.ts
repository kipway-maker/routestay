// eslint-disable-next-line @typescript-eslint/no-require-imports
const AmadeusSDK = require("amadeus");
import { buildHotelsAffiliateUrl } from "./affiliate";

const MOCK_MODE = !process.env.AMADEUS_CLIENT_ID;

// Client Amadeus (server-side only)
const amadeus = MOCK_MODE
  ? null
  : new AmadeusSDK({
      clientId: process.env.AMADEUS_CLIENT_ID!,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
      hostname: "test", // sandbox
    });

export interface Hotel {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceFromRouteKm: number;
  detourKm: number;
  detourMinutes: number;
  routePositionPct: number;
  city: string;
  pricePerNight: number | null;
  currency: string;
  rating: number | null;
  imageUrl: string;
  checkinDeadline: string | null; // "HH:MM"
  hasEVCharger: boolean;
  accommodationType: "hotel" | "bb" | "auberge" | "camping";
  source: "hotels_com" | "booking" | "tripadvisor" | "osm" | "mock";
  bookingUrl?: string;
  images: string[]; // carousel
  address?: string;  // ex: "12 rue de la Paix"
}

export async function searchHotelsAlongRoute(
  points: Array<{ lat: number; lng: number }>
): Promise<Hotel[]> {
  if (MOCK_MODE) return generateMockHotels(points);

  const allHotels: Hotel[] = [];

  // Search in parallel for each point (max 5 requests)
  const sampledPoints = points.slice(0, 5);

  await Promise.allSettled(
    sampledPoints.map(async (point) => {
      try {
        // 1. Find hotels by geolocation
        const hotelsRes = await amadeus.referenceData.locations.hotels.byGeocode.get({
          latitude: point.lat,
          longitude: point.lng,
          radius: 50,
          radiusUnit: "KM",
        });

        if (!hotelsRes.data?.length) return;

        // 2. Take first 10 hotels
        const hotelIds = hotelsRes.data
          .slice(0, 10)
          .map((h: any) => h.hotelId)
          .join(",");

        // 3. Get offers/prices
        const offersRes = await amadeus.shopping.hotelOffersSearch.get({
          hotelIds,
          adults: 1,
          checkInDate: getNextWeekend(),
          checkOutDate: getNextWeekendPlusOne(),
          currency: "EUR",
        });

        if (!offersRes.data) return;

        offersRes.data.forEach((offer: any) => {
          const hotel = offer.hotel;
          const price = offer.offers?.[0]?.price?.total;

          allHotels.push({
            id: hotel.hotelId,
            name: hotel.name,
            lat: hotel.latitude,
            lng: hotel.longitude,
            distanceFromRouteKm: 0,
            detourKm: 0,
            detourMinutes: 0,
            routePositionPct: 50,
            city: hotel.address?.cityName || "",
            pricePerNight: price ? parseFloat(price) : null,
            currency: "EUR",
            rating: hotel.rating ? parseFloat(hotel.rating) : null,
            imageUrl: MOCK_IMAGES_BY_TYPE["hotel"][Math.floor(Math.random() * MOCK_IMAGES_BY_TYPE["hotel"].length)],
            images: (() => {
              const imgs = MOCK_IMAGES_BY_TYPE["hotel"];
              const start = Math.floor(Math.random() * imgs.length);
              return [0, 1, 2].map((k) => imgs[(start + k) % imgs.length]);
            })(),
            checkinDeadline: null,
            hasEVCharger: false,
            accommodationType: "hotel" as const,
            source: "hotels_com",
          });
        });
      } catch {
        // Silently skip failed points
      }
    })
  );

  return deduplicateHotels(allHotels);
}

function getNextWeekend(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return d.toISOString().split("T")[0];
}

function getNextWeekendPlusOne(): string {
  const d = new Date(getNextWeekend());
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function deduplicateHotels(hotels: Hotel[]): Hotel[] {
  const seen = new Set<string>();
  return hotels.filter((h) => {
    if (seen.has(h.id)) return false;
    seen.add(h.id);
    return true;
  });
}

// Images par type d'hébergement — Unsplash, toutes libres de droits
const MOCK_IMAGES_BY_TYPE: Record<Hotel["accommodationType"], string[]> = {
  hotel: [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1551882547-ff40c599fb2e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1564501049412-61c2a01f61d4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1603903631918-a7cf5b99bd58?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=600&h=400&fit=crop",
  ],
  bb: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1595877244574-e90ce41ce089?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop",
  ],
  auberge: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&h=400&fit=crop",
  ],
  camping: [
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1533575770077-052fa2c609fc?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1496080174650-637e3f22fa03?w=600&h=400&fit=crop",
  ],
};

function generateMockHotels(points: Array<{ lat: number; lng: number }>): Hotel[] {
  const mockNames = [
    "Hôtel des Alpes", "Le Grand Relais", "Ibis Budget",
    "Novotel", "B&B Hôtel", "Mercure", "Kyriad",
    "Best Western", "Campanile", "Logis de France",
  ];
  const ACCOM_TYPES: Hotel["accommodationType"][] = [
    "hotel", "hotel", "hotel", "bb", "bb", "auberge", "auberge", "camping", "hotel", "auberge",
  ];
  const cities = ["Lyon", "Grenoble", "Chambéry", "Belley", "Bourg-en-Bresse", "Aix-les-Bains"];

  const CHECKIN_DEADLINES = ["22:00", "23:00", "23:00", "23:30", "00:00", null];

  const MOCK_ADDRESSES = [
    "12 rue de la République", "3 avenue Jean Jaurès", "47 boulevard Victor Hugo",
    "8 rue du Général de Gaulle", "21 place de la Mairie", "15 rue des Alpes",
    "6 avenue de la Gare", "33 rue Nationale", "2 place Bellecour", "18 rue du Commerce",
  ];

  return points.flatMap((point, i) =>
    Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, j) => {
      const dist = Math.round(Math.random() * 8 * 10) / 10;
      const detourKm = Math.round(dist * 2 * 10) / 10;
      const detourMinutes = Math.round((detourKm / 65) * 60);
      const routePositionPct = points.length > 1 ? Math.round((i / (points.length - 1)) * 100) : 50;
      return {
        id: `mock-${i}-${j}`,
        name: mockNames[(i * 3 + j) % mockNames.length],
        lat: point.lat + (Math.random() - 0.5) * 0.1,
        lng: point.lng + (Math.random() - 0.5) * 0.1,
        distanceFromRouteKm: dist,
        detourKm,
        detourMinutes,
        routePositionPct,
        city: cities[(i + j) % cities.length],
        address: MOCK_ADDRESSES[(i * 3 + j) % MOCK_ADDRESSES.length],
        pricePerNight: Math.floor(Math.random() * 120) + 45,
        currency: "EUR",
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        imageUrl: (() => {
          const type = ACCOM_TYPES[(i * 3 + j) % ACCOM_TYPES.length];
          const imgs = MOCK_IMAGES_BY_TYPE[type];
          return imgs[(i * 3 + j) % imgs.length];
        })(),
        images: (() => {
          const type = ACCOM_TYPES[(i * 3 + j) % ACCOM_TYPES.length];
          const imgs = MOCK_IMAGES_BY_TYPE[type];
          return [0, 1, 2].map((k) => imgs[(i * 3 + j + k) % imgs.length]);
        })(),
        checkinDeadline: CHECKIN_DEADLINES[(i * 3 + j) % CHECKIN_DEADLINES.length],
        hasEVCharger: (i * 3 + j) % 3 === 0,
        accommodationType: ACCOM_TYPES[(i * 3 + j) % ACCOM_TYPES.length],
        source: "mock" as Hotel["source"],
        bookingUrl: buildHotelsAffiliateUrl({
          name: mockNames[(i * 3 + j) % mockNames.length],
          city: cities[(i + j) % cities.length],
          lat: point.lat + (Math.random() - 0.5) * 0.1,
          lng: point.lng + (Math.random() - 0.5) * 0.1,
        }),
      };
    })
  );
}
