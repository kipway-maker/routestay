/**
 * affiliate.ts — Liens affiliés par source
 *
 * Hotels.com : CJ PID 101763590 / AID 14061559
 * Booking.com : programme affilié direct (affiliate_id à renseigner)
 * TripAdvisor : lien direct vers la fiche hôtel (pas de programme CJ actif)
 */

// ── Hotels.com ──────────────────────────────────────────────────
// Redirect CJ confirmé (cookie 30j, rffrid généré auto par jdoqocy.com).
// On encode l'URL Hotels.com /search directement dans le param ?url=
// Note : Hotels.com via RapidAPI (Hotels4) est actuellement hors service,
// donc ces liens renvoient vers la recherche Hotels.com sans hotel pré-sélectionné.
// Le cookie CJ est quand même setté → les commissions sont trackées.

const CJ_PID = "101763590";
const CJ_AID = "14061559";
const CJ_REDIRECT = `https://www.jdoqocy.com/click-${CJ_PID}-${CJ_AID}`;

export interface AffiliateOptions {
  name: string;
  city: string;
  lat?: number;
  lng?: number;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
}

export function buildHotelsAffiliateUrl(opts: AffiliateOptions): string {
  const { name, city, checkIn, checkOut, adults = 1 } = opts;
  const destination = [name, city].filter(Boolean).join(" ");
  const params = new URLSearchParams({ destination });
  if (checkIn)  params.set("checkin",  checkIn);   // minuscules — obligatoire Hotels.com
  if (checkOut) params.set("checkout", checkOut);
  params.set("adults", String(adults));
  params.set("rooms", "1");
  const hotelsUrl = `https://fr.hotels.com/search?${params.toString()}`;
  return `${CJ_REDIRECT}?url=${encodeURIComponent(hotelsUrl)}`;
}

// ── Booking.com ─────────────────────────────────────────────────
// Programme affilié Booking.com : https://www.booking.com/affiliate-program/v2/index.html
// Remplace BOOKING_AID par ton AID Booking quand tu l'auras
const BOOKING_AID = ""; // ex: "1234567"

export function buildBookingAffiliateUrl(opts: AffiliateOptions): string {
  const { name, city, lat, lng, checkIn, checkOut } = opts;
  const ss = [name, city].filter(Boolean).join(", ");
  const params = new URLSearchParams({ ss });
  if (checkIn)  params.set("checkin", checkIn);
  if (checkOut) params.set("checkout", checkOut);
  if (lat != null && lng != null) {
    params.set("latitude",  String(lat));
    params.set("longitude", String(lng));
  }
  params.set("group_adults", "1");
  params.set("no_rooms", "1");
  if (BOOKING_AID) params.set("aid", BOOKING_AID);
  return `https://www.booking.com/search.html?${params.toString()}`;
}

// ── TripAdvisor ─────────────────────────────────────────────────
// TripAdvisor programme affilié : https://www.tripadvisor.com/affiliates
// On redirige vers la fiche directe si disponible, sinon recherche

export interface TripAdvisorAffiliateOptions extends AffiliateOptions {
  taUrl?: string; // URL directe de la fiche TripAdvisor si disponible
}

export function buildTripAdvisorAffiliateUrl(opts: TripAdvisorAffiliateOptions): string {
  if (opts.taUrl) return opts.taUrl;
  const { name, city } = opts;
  const q = encodeURIComponent([name, city].filter(Boolean).join(" "));
  return `https://www.tripadvisor.fr/Search?q=${q}&searchSessionId=hotels`;
}

// ── Dates ───────────────────────────────────────────────────────

export function getCheckDates(departureDate?: string | null): { checkIn: string; checkOut: string } {
  if (departureDate) {
    const d = new Date(departureDate);
    const out = new Date(d);
    out.setDate(out.getDate() + 1);
    return {
      checkIn:  d.toISOString().split("T")[0],
      checkOut: out.toISOString().split("T")[0],
    };
  }
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
  const out = new Date(d);
  out.setDate(out.getDate() + 1);
  return {
    checkIn:  d.toISOString().split("T")[0],
    checkOut: out.toISOString().split("T")[0],
  };
}
