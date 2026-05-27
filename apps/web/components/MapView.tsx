"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, useMap } from "react-leaflet";
import { Hotel } from "@/lib/amadeus";

function createPricePin(price: number | null, selected: boolean) {
  const bg = selected ? "#FF6240" : "#1A1A2E";
  const label = price ? `${price} €` : "—";
  return L.divIcon({
    className: "",
    html: `<div style="
      background: ${bg};
      color: #fff;
      border-radius: 20px;
      padding: 5px 10px;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      border: 2px solid #fff;
      transform: ${selected ? "scale(1.1)" : "scale(1)"};
      transition: all 0.15s;
      font-family: system-ui, sans-serif;
    ">${label}</div>`,
    iconSize: undefined,
    iconAnchor: [0, 0],
  });
}

interface FitBoundsProps {
  route: { type: string; coordinates: [number, number][] } | null;
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
}

function FitBounds({ route, origin, destination }: FitBoundsProps) {
  const map = useMap();
  useEffect(() => {
    if (route && route.coordinates.length > 0) {
      const bounds = L.latLngBounds(route.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]));
      map.fitBounds(bounds, { padding: [60, 60] });
    } else if (origin && destination) {
      map.fitBounds([[origin.lat, origin.lng], [destination.lat, destination.lng]], { padding: [60, 60] });
    }
  }, [route, origin, destination, map]);
  return null;
}

function FlyToHotel({ hotel }: { hotel: Hotel | null }) {
  const map = useMap();
  const prevId = useRef<string | null>(null);
  useEffect(() => {
    if (hotel && hotel.id !== prevId.current) {
      map.flyTo([hotel.lat, hotel.lng], 11, { duration: 0.8 });
      prevId.current = hotel.id;
    }
  }, [hotel, map]);
  return null;
}

interface MapViewProps {
  route: { type: string; coordinates: [number, number][] } | null;
  hotels: Hotel[];
  origin: { name: string; lat: number; lng: number } | null;
  destination: { name: string; lat: number; lng: number } | null;
  selectedHotelId: string | null;
  onSelectHotel: (id: string) => void;
  onExpandHotel: (id: string) => void;
}

export default function MapView({ route, hotels, origin, destination, selectedHotelId, onSelectHotel, onExpandHotel }: MapViewProps) {
  const selectedHotel = hotels.find((h) => h.id === selectedHotelId) || null;
  const routePositions: [number, number][] = route
    ? route.coordinates.map(([lng, lat]) => [lat, lng])
    : [];

  return (
    <MapContainer
      center={[46.5, 2.5]}
      zoom={6}
      style={{ height: "100%", width: "100%", background: "#e8e8e8" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        url={`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png${process.env.NEXT_PUBLIC_STADIA_API_KEY ? `?api_key=${process.env.NEXT_PUBLIC_STADIA_API_KEY}` : ""}`}
        minZoom={0}
        maxZoom={20}
      />

      <FitBounds route={route} origin={origin} destination={destination} />
      <FlyToHotel hotel={selectedHotel} />

      {routePositions.length > 0 && (
        <Polyline
          positions={routePositions}
          pathOptions={{ color: "#FF6240", weight: 5, opacity: 0.95, lineCap: "round", lineJoin: "round" }}
        />
      )}

      {origin && (
        <CircleMarker center={[origin.lat, origin.lng]} radius={10}
          pathOptions={{ color: "#fff", fillColor: "#FF6240", fillOpacity: 1, weight: 3 }}>
          <Popup>{origin.name.split(",")[0]}</Popup>
        </CircleMarker>
      )}
      {destination && (
        <CircleMarker center={[destination.lat, destination.lng]} radius={10}
          pathOptions={{ color: "#fff", fillColor: "#06D6A0", fillOpacity: 1, weight: 3 }}>
          <Popup>{destination.name.split(",")[0]}</Popup>
        </CircleMarker>
      )}

      {hotels.map((hotel) => (
        <Marker
          key={hotel.id}
          position={[hotel.lat, hotel.lng]}
          icon={createPricePin(hotel.pricePerNight, selectedHotelId === hotel.id)}
          zIndexOffset={selectedHotelId === hotel.id ? 1000 : 0}
          eventHandlers={{ click: () => onSelectHotel(hotel.id) }}
        >
          <Popup maxWidth={300} className="kipway-popup">
            <div style={{ width: "280px", fontFamily: "system-ui, sans-serif", padding: "8px" }}>
              <div style={{ position: "relative", width: "100%", height: "160px", background: "#f3f4f6", borderRadius: "14px", overflow: "hidden", marginBottom: "16px" }}>
                <img src={hotel.imageUrl} alt={hotel.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-470ec8958588?w=600&h=400&fit=crop"; }}
                />
                {hotel.pricePerNight && (
                  <div style={{
                    position: "absolute", bottom: "10px", right: "10px",
                    background: "rgba(255,255,255,0.96)", borderRadius: "9px",
                    padding: "4px 12px", fontSize: "14px", fontWeight: 700, color: "#1A1A2E",
                  }}>{hotel.pricePerNight} €</div>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#1A1A2E", marginBottom: "6px",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {hotel.name}
              </div>
              <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px", display: "flex", gap: "10px" }}>
                <span>{hotel.city}</span>
                {hotel.rating && <span>★ {hotel.rating}</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#FF6240", fontWeight: 600 }}>
                  {hotel.detourMinutes === 0 ? "Sur la route" : `+${hotel.detourMinutes} min`}
                </span>
                <button
                  onClick={() => onExpandHotel(hotel.id)}
                  style={{
                    padding: "9px 20px", borderRadius: "20px",
                    background: "#FF6240", color: "#fff", border: "none",
                    fontSize: "13px", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Voir l&apos;hôtel →
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
