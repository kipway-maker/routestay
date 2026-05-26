export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface Route {
  id: string;
  origin: Location;
  destination: Location;
  waypoints: Location[];
  distanceKm: number;
  durationMin: number;
}

export interface Hotel {
  id: string;
  name: string;
  location: Location;
  distanceFromRouteKm: number;
  pricePerNight: number;
  currency: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  amenities: string[];
  source: "booking" | "expedia" | "hotels" | "trivago" | "mock";
  bookingUrl?: string;
}

export interface SearchParams {
  origin: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  radiusKm: number;
}

export interface SearchResult {
  route: Route;
  hotels: Hotel[];
  totalResults: number;
}
