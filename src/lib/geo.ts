/**
 * Proiecția folosită de formele din src/data/geo/romaniaCounties.ts
 * (echidistantă simplă, calibrată pe caseta României).
 * Permite plasarea punctelor lat/lon peste aceleași contururi SVG.
 */
export const PROJECTION = {
  lonOrigin: 20.26,
  latOrigin: 48.27,
  scaleX: 91.33,
  scaleY: 91.42,
} as const;

export function projectPoint(latitude: number, longitude: number): { x: number; y: number } {
  return {
    x: 18 + (longitude - PROJECTION.lonOrigin) * PROJECTION.scaleX,
    y: 18 + (PROJECTION.latOrigin - latitude) * PROJECTION.scaleY,
  };
}

/** Caseta de încadrare a unui traseu SVG („M x y L x y …”). */
export function pathBounds(path: string): { minX: number; minY: number; maxX: number; maxY: number } {
  const numbers = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    const x = numbers[i] as number;
    const y = numbers[i + 1] as number;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}
