/**
 * STRAT DEMO / MOCK — poziții aproximative pentru ONG-uri și școli.
 *
 * Registrul ONG nu conține adrese sau coordonate. Punctele generate aici sunt
 * stabile (pornesc de la id-ul rândului), dar nu reprezintă sedii reale:
 * - dacă localitatea este cunoscută, punctul este deplasat puțin în jurul ei;
 * - altfel, punctul este ales în interiorul județului declarat.
 */
import {
  getLocalityCoordinates,
  localityCoordinates,
  normalizeKey,
  type LatLng,
} from "@/data/enrichment/localityCoordinates";
import { romaniaCountyShapes } from "@/data/geo/romaniaCounties";
import { pathBounds, PROJECTION, projectPoint } from "@/lib/geo";

type Point = { x: number; y: number };

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function random(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function localityCenter(locality: string): LatLng | null {
  const exact = getLocalityCoordinates(locality);
  if (exact) return exact;

  const key = normalizeKey(locality);
  if (!key || key === "nedeterminat") return null;
  if (key.includes("bucuresti") || /^sectorul? [1-6]/.test(key)) {
    return getLocalityCoordinates("București");
  }

  // Registrul folosește des forme precum „CORBEANCA - IF” sau
  // „RÂMNICU VALCEA”; potrivim cel mai lung nume cunoscut conținut în text.
  const candidate = Object.entries(localityCoordinates)
    .filter(([known]) => key === known || key.startsWith(`${known} `) || key.endsWith(` ${known}`))
    .sort(([left], [right]) => right.length - left.length)[0];
  return candidate?.[1] ?? null;
}

function shapeForCounty(county: string) {
  const key = normalizeKey(county);
  return (
    romaniaCountyShapes.find((shape) => {
      const name = shape.name === "Bucharest" ? "București" : shape.name;
      return normalizeKey(name) === key;
    }) ?? null
  );
}

function polygonFromPath(path: string): Point[] {
  const values = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const points: Point[] = [];
  for (let index = 0; index + 1 < values.length; index += 2) {
    points.push({ x: values[index] as number, y: values[index + 1] as number });
  }
  return points;
}

function isInside(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (
    let current = 0, previous = polygon.length - 1;
    current < polygon.length;
    previous = current++
  ) {
    const a = polygon[current] as Point;
    const b = polygon[previous] as Point;
    const crosses =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function unprojectPoint(point: Point): LatLng {
  return {
    latitude: PROJECTION.latOrigin - (point.y - 18) / PROJECTION.scaleY,
    longitude: PROJECTION.lonOrigin + (point.x - 18) / PROJECTION.scaleX,
  };
}

function pointInCounty(county: string, seed: string): LatLng | null {
  const shape = shapeForCounty(county);
  if (!shape) return null;

  const bounds = pathBounds(shape.path);
  const polygon = polygonFromPath(shape.path);
  const next = random(hash(seed));
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const point = {
      x: bounds.minX + next() * (bounds.maxX - bounds.minX),
      y: bounds.minY + next() * (bounds.maxY - bounds.minY),
    };
    if (isInside(point, polygon)) return unprojectPoint(point);
  }

  // Centrul etichetei este garantat vizual în zona județului.
  return unprojectPoint({ x: shape.labelX, y: shape.labelY });
}

function isCoordinateInCounty(coordinates: LatLng, county: string): boolean {
  const shape = shapeForCounty(county);
  if (!shape) return true;
  return isInside(
    projectPoint(coordinates.latitude, coordinates.longitude),
    polygonFromPath(shape.path),
  );
}

function jitterAround(center: LatLng, seed: string): LatLng {
  const next = random(hash(seed));
  const angle = next() * Math.PI * 2;
  const radiusKm = 0.35 + next() * 2.15;
  return {
    latitude: center.latitude + (Math.sin(angle) * radiusKm) / 111,
    longitude:
      center.longitude +
      (Math.cos(angle) * radiusKm) /
        (111 * Math.max(Math.cos((center.latitude * Math.PI) / 180), 0.2)),
  };
}

export function getMockCoordinates({
  id,
  locality,
  county,
}: {
  id: string;
  locality: string;
  county: string;
}): LatLng | null {
  const center = localityCenter(locality);
  if (center && isCoordinateInCounty(center, county)) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const coordinates = jitterAround(center, `${id}:locality:${attempt}`);
      if (isCoordinateInCounty(coordinates, county)) return coordinates;
    }
    return center;
  }
  return pointInCounty(county, `${id}:county`);
}

export function getMockNgoCoordinates(options: {
  id: string;
  locality: string;
  county: string;
}): LatLng | null {
  return getMockCoordinates(options);
}

export function getMockSchoolCoordinates(options: {
  id: string;
  locality: string;
  county: string;
}): LatLng | null {
  return getMockCoordinates(options);
}
