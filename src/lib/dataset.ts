/**
 * Stratul de import / normalizare.
 *
 * Combină fișierele generate din CSV cu stratul de coordonate disponibil și
 * expune modelul intern din src/lib/model.ts.
 */
import { schoolsImported } from "@/data/raw/schools2026Imported";
import type { RawSchoolRow } from "@/data/raw/schools2026";
import { ngosImported } from "@/data/raw/ngosImported";
import { schoolEnrichment } from "@/data/enrichment/schoolEnrichment";
import { getLocalityCoordinates, normalizeKey } from "@/data/enrichment/localityCoordinates";
import { getMockNgoCoordinates, getMockSchoolCoordinates } from "@/data/enrichment/ngoCoordinates";
import { romaniaCountyShapes } from "@/data/geo/romaniaCounties";
import type {
  CountyStats,
  NationalStats,
  Ngo,
  School,
  SchoolComparison,
  SchoolYear,
} from "./model";

export const CURRENT_YEAR: SchoolYear = 2026;
export const PREVIOUS_YEAR: SchoolYear = 2025;

const canonicalCountyNames = romaniaCountyShapes.map((shape) =>
  shape.name === "Bucharest" ? "București" : shape.name,
);

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(
      /[ăâîșşţț]/gi,
      (c) => ({ ă: "a", â: "a", î: "i", ș: "s", ş: "s", ţ: "t", ț: "t" })[c.toLowerCase()] ?? c,
    )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Numele școlii din dataset conține adesea localitatea după virgulă. */
function localityFromName(schoolName: string): string | null {
  const parts = schoolName.split(",");
  if (parts.length < 2) return null;
  const last = parts[parts.length - 1]?.trim();
  return last && last.length > 1 ? last : null;
}

/**
 * Când numele nu conține virgulă, se încearcă ultimele cuvinte („Școala
 * Gimnazială Săceni” → „Săceni”) față de tabelul demo de coordonate.
 */
function localityFromNameTail(schoolName: string): string | null {
  const words = schoolName
    .replace(/[.\-–]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  for (const size of [2, 1]) {
    if (words.length < size) continue;
    const candidate = words.slice(words.length - size).join(" ");
    if (getLocalityCoordinates(candidate)) return candidate;
  }
  return null;
}

function normalizeSchool(row: RawSchoolRow, year: SchoolYear): School {
  const extra = schoolEnrichment[row["nume scoala"]] ?? null;
  const locality =
    extra?.locality ??
    localityFromName(row["nume scoala"]) ??
    localityFromNameTail(row["nume scoala"]);
  const id = `${slugify(row.Judet)}-${slugify(row["nume scoala"])}-${year}`;
  const coordinates =
    extra ??
    getMockSchoolCoordinates({
      id,
      locality: locality ?? "",
      county: row.Judet,
    });
  return {
    id,
    county: row.Judet,
    schoolName: row["nume scoala"],
    enAverage: row["medie en"],
    mathAverage: row["medie mate"],
    romanianAverage: row["medie romana"],
    graduates: row["nr absolventi"],
    locality,
    latitude: coordinates?.latitude ?? null,
    longitude: coordinates?.longitude ?? null,
    year,
  };
}

export const schools: School[] = [
  ...schoolsImported.map((row) =>
    normalizeSchool(
      {
        Judet: row.Judet,
        "nume scoala": row.Scoala,
        "medie en": row.Medie_Generala,
        "medie mate": row.Medie_Matematica,
        "medie romana": row.Medie_Romana,
        "nr absolventi": row.Numar_Elevi,
      },
      row.An,
    ),
  ),
];

export const schoolCounties = Array.from(
  new Set(schools.filter((school) => school.year === CURRENT_YEAR).map((school) => school.county)),
).sort((left, right) => left.localeCompare(right, "ro"));

/** Uniformizează majusculele, diacriticele și separatorii dintre cele două CSV-uri. */
export function normalizeCountyName(value: string): string {
  const key = normalizeKey(value);
  if (!key || key === "nedeterminat") return "Nedeterminat";
  return canonicalCountyNames.find((county) => normalizeKey(county) === key) ?? value.trim();
}

export const ngos: Ngo[] = ngosImported.map((row) => {
  const locality = row.Localitate || "Nedeterminată";
  const county = normalizeCountyName(row.Judet);
  const id = `${slugify(row["Denumire ONG"])}-${row["Nr. Crt."]}`;
  const coordinates = getMockNgoCoordinates({ id, locality, county });
  return {
    id,
    name: row["Denumire ONG"],
    registrationNumber: row["Numar Registru"],
    locality,
    county,
    status: row.Status,
    legalCategory: row["Categorie Personalitate Juridica"],
    publicUtility: row["Are Utilitate Publica"].trim().toLowerCase() === "da",
    relevantCategories: row["Categorii relevante"]
      .split(/[;+]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0),
    interventionType: row["Tip intervenție"].trim(),
    relevanceReason: row["Motiv relevanță"].trim(),
    latitude: coordinates?.latitude ?? null,
    longitude: coordinates?.longitude ?? null,
  };
});

/* ---------- interogări ---------- */

export function getSchoolsByYear(year: SchoolYear = CURRENT_YEAR): School[] {
  return schools.filter((s) => s.year === year);
}

export function getSchoolById(id: string): School | null {
  return schools.find((s) => s.id === id) ?? null;
}

export function getNgoById(id: string): Ngo | null {
  return ngos.find((n) => n.id === id) ?? null;
}

export function getNgosByCounty(county: string): Ngo[] {
  const countyKey = normalizeKey(county);
  return ngos.filter((n) => {
    const status = normalizeKey(n.status);
    return (
      normalizeKey(n.county) === countyKey &&
      (status === "inregistrat" || status === "activ" || status === "activa")
    );
  });
}

/** Medie ponderată după numărul de absolvenți; rândurile fără efectiv valid sunt excluse. */
function weightedAverage(values: { value: number; weight: number }[]): number {
  const weightedValues = values.filter(
    (item) => Number.isFinite(item.value) && Number.isFinite(item.weight) && item.weight > 0,
  );
  const totalWeight = weightedValues.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight > 0) {
    return weightedValues.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight;
  }
  return 0;
}

export function getCountyStats(
  county: string,
  year: SchoolYear = CURRENT_YEAR,
): CountyStats | null {
  const list = getSchoolsByYear(year).filter(
    (s) => s.county.toLowerCase() === county.toLowerCase(),
  );
  const first = list[0];
  if (!first) return null;
  return {
    county: first.county,

    year,
    enAverage: weightedAverage(list.map((s) => ({ value: s.enAverage, weight: s.graduates }))),
    mathAverage: weightedAverage(list.map((s) => ({ value: s.mathAverage, weight: s.graduates }))),
    romanianAverage: weightedAverage(
      list.map((s) => ({ value: s.romanianAverage, weight: s.graduates })),
    ),
    schoolCount: list.length,
    graduates: list.reduce((sum, s) => sum + s.graduates, 0),
  };
}

export function getAllCountyStats(year: SchoolYear = CURRENT_YEAR): CountyStats[] {
  const counties = Array.from(new Set(getSchoolsByYear(year).map((s) => s.county)));
  return counties
    .map((c) => getCountyStats(c, year))
    .filter((c): c is CountyStats => c !== null)
    .sort((a, b) => a.enAverage - b.enAverage);
}

export function getNationalStats(year: SchoolYear = CURRENT_YEAR): NationalStats {
  const list = getSchoolsByYear(year);
  return {
    year,
    enAverage: weightedAverage(list.map((s) => ({ value: s.enAverage, weight: s.graduates }))),
    schoolCount: list.length,
    countyCount: new Set(list.map((s) => s.county)).size,
    graduates: list.reduce((sum, s) => sum + s.graduates, 0),
  };
}

export function getSchoolsInCounty(county: string, year: SchoolYear = CURRENT_YEAR): School[] {
  return getSchoolsByYear(year)
    .filter((s) => s.county.toLowerCase() === county.toLowerCase())
    .sort((a, b) => a.enAverage - b.enAverage);
}

export function getCountyBySlug(slug: string): string | null {
  return canonicalCountyNames.find((c) => slugify(c) === slug.toLowerCase()) ?? null;
}

/** Structura de comparație: școală an curent / an anterior / județ / România. */
export function getSchoolComparison(schoolId: string): SchoolComparison | null {
  const school = getSchoolById(schoolId);
  if (!school) return null;
  // Potrivirea între ani se face pe județ + nume normalizat (fără diacritice,
  // majuscule, spații duble sau punctuație), nu pe id-ul de rând.
  const key = `${normalizeKey(school.county)}::${normalizeKey(school.schoolName)}`;
  const previousYear =
    schools.find(
      (s) =>
        s.year === PREVIOUS_YEAR &&
        s.year !== school.year &&
        `${normalizeKey(s.county)}::${normalizeKey(s.schoolName)}` === key,
    ) ?? null;
  return {
    school,
    previousYear,
    county: getCountyStats(school.county, school.year),
    national: getNationalStats(school.year),
  };
}

/* ---------- căutare școli ---------- */

/**
 * Căutare în interiorul unui județ: ignoră literele mari/mici, diacriticele
 * și acceptă potriviri parțiale (pe nume sau pe localitate).
 */
export function searchSchoolsInCounty(
  county: string,
  query: string,
  year: SchoolYear = CURRENT_YEAR,
  limit = 8,
): School[] {
  const term = normalizeKey(query);
  const list = getSchoolsInCounty(county, year);
  if (term.length < 2) return [];
  const scored = list
    .map((school) => {
      const name = normalizeKey(school.schoolName);
      const locality = normalizeKey(school.locality ?? "");
      const index = name.indexOf(term);
      const localityIndex = locality.indexOf(term);
      if (index === -1 && localityIndex === -1) return null;
      const score = index === 0 ? 0 : index > 0 ? 1 : 2;
      return { school, score, index: index === -1 ? localityIndex : index };
    })
    .filter((item): item is { school: School; score: number; index: number } => item !== null)
    .sort(
      (a, b) => a.score - b.score || a.index - b.index || b.school.enAverage - a.school.enAverage,
    );
  return scored.slice(0, limit).map((item) => item.school);
}

/** Căutare națională după numele școlii, localitate sau județ. */
export function searchSchools(query: string, limit = 8): School[] {
  const term = normalizeKey(query);
  if (term.length < 2) return [];

  return getSchoolsByYear(CURRENT_YEAR)
    .map((school) => {
      const name = normalizeKey(school.schoolName);
      const locality = normalizeKey(school.locality ?? "");
      const county = normalizeKey(school.county);
      const nameIndex = name.indexOf(term);
      const localityIndex = locality.indexOf(term);
      const countyIndex = county.indexOf(term);
      if (nameIndex === -1 && localityIndex === -1 && countyIndex === -1) return null;

      const score = nameIndex === 0 ? 0 : nameIndex > 0 ? 1 : localityIndex >= 0 ? 2 : 3;
      const index = nameIndex >= 0 ? nameIndex : localityIndex >= 0 ? localityIndex : countyIndex;
      return { school, score, index };
    })
    .filter((item): item is { school: School; score: number; index: number } => item !== null)
    .sort(
      (a, b) =>
        a.score - b.score ||
        a.index - b.index ||
        a.school.schoolName.localeCompare(b.school.schoolName, "ro"),
    )
    .slice(0, limit)
    .map((item) => item.school);
}

/** Școlile cu coordonate cunoscute, pentru harta județului. */
export function getMappableSchoolsInCounty(
  county: string,
  year: SchoolYear = CURRENT_YEAR,
): School[] {
  return getSchoolsInCounty(county, year).filter(
    (s) => s.latitude !== null && s.longitude !== null,
  );
}

/** Media școlii în anul anterior (pentru comparație rapidă în tooltip). */
export function getPreviousYearAverage(school: School): number | null {
  const previous = schools.find(
    (s) =>
      s.year === PREVIOUS_YEAR &&
      s.county === school.county &&
      normalizeKey(s.schoolName) === normalizeKey(school.schoolName),
  );
  return previous?.enAverage ?? null;
}
