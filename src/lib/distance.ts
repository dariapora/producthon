/** Distanță geografică în linie dreaptă (Haversine) + formatare în română. */

export function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Sub 100 km → o zecimală; peste 100 km → kilometru întreg. */
export function formatKm(km: number): string {
  if (km < 100) return `${km.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(km)} km`;
}
