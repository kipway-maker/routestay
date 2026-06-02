export interface RoutePoint {
  lat: number;
  lng: number;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function sampleRoutePoints(
  geometry: { type: string; coordinates: [number, number][] },
  intervalKm: number
): RoutePoint[] {
  const coords = geometry.coordinates; // [lng, lat]
  if (!coords || coords.length === 0) return [];

  const result: RoutePoint[] = [{ lat: coords[0][1], lng: coords[0][0] }];

  let accumulatedKm = 0;
  let nextThreshold = intervalKm;

  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1];
    const [lng2, lat2] = coords[i];
    const segmentKm = haversineKm(lat1, lng1, lat2, lng2);
    accumulatedKm += segmentKm;

    while (accumulatedKm >= nextThreshold) {
      // Interpolate position at the threshold
      const overshoot = accumulatedKm - nextThreshold;
      const t = 1 - overshoot / segmentKm;
      result.push({
        lat: lat1 + t * (lat2 - lat1),
        lng: lng1 + t * (lng2 - lng1),
      });
      nextThreshold += intervalKm;
    }
  }

  // Always include destination
  const last = coords[coords.length - 1];
  const lastPoint = { lat: last[1], lng: last[0] };
  const prev = result[result.length - 1];
  if (haversineKm(prev.lat, prev.lng, lastPoint.lat, lastPoint.lng) > 1) {
    result.push(lastPoint);
  }

  return result;
}
