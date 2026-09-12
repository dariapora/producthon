import { normalizeKey } from "@/data/enrichment/localityCoordinates";
import { CURRENT_YEAR, getSchoolsByYear, ngos } from "@/lib/dataset";
import { getHartaEduAlerts } from "@/lib/hartaedu";
import { isEligible } from "@/lib/ngoRecommendations";
import type { Ngo, School } from "@/lib/model";

export type SupportScope = "county" | "national";

export type PrioritySchool = {
  school: School;
  alerts: ReturnType<typeof getHartaEduAlerts>;
  urgency: number;
};

const locatableNgos = ngos.filter(
  (ngo) => isEligible(ngo) && normalizeKey(ngo.county) !== "nedeterminat",
);

const locatableNgosByCounty = new Map<string, Ngo[]>();
locatableNgos.forEach((ngo) => {
  const key = normalizeKey(ngo.county);
  const countyNgos = locatableNgosByCounty.get(key) ?? [];
  countyNgos.push(ngo);
  locatableNgosByCounty.set(key, countyNgos);
});

export const locatableNgoCounties = Array.from(
  new Set(locatableNgos.map((ngo) => ngo.county)),
).sort((left, right) => left.localeCompare(right, "ro"));

function urgencyRank(value: string): number {
  const normalized = normalizeKey(value);
  if (normalized.includes("foarte urgent")) return 4;
  if (normalized.includes("urgent")) return 3;
  if (normalized.includes("medie")) return 2;
  if (normalized.includes("scazut")) return 1;
  return 0;
}

export function searchLocatableNgos(query: string, county?: string, limit = 8): Ngo[] {
  const term = normalizeKey(query);
  if (term.length < 2) return [];

  const candidates = county
    ? (locatableNgosByCounty.get(normalizeKey(county)) ?? [])
    : locatableNgos;

  return candidates
    .map((ngo) => {
      const name = normalizeKey(ngo.name);
      const locality = normalizeKey(ngo.locality);
      const county = normalizeKey(ngo.county);
      const nameIndex = name.indexOf(term);
      const localityIndex = locality.indexOf(term);
      const countyIndex = county.indexOf(term);
      if (nameIndex === -1 && localityIndex === -1 && countyIndex === -1) return null;
      const score = nameIndex === 0 ? 0 : nameIndex > 0 ? 1 : localityIndex >= 0 ? 2 : 3;
      return { ngo, score };
    })
    .filter((item): item is { ngo: Ngo; score: number } => item !== null)
    .sort((a, b) => a.score - b.score || a.ngo.name.localeCompare(b.ngo.name, "ro"))
    .slice(0, limit)
    .map(({ ngo }) => ngo);
}

export function getRankedSchoolsForNgo(ngo: Ngo, scope: SupportScope): PrioritySchool[] {
  const county = normalizeKey(ngo.county);
  return getSchoolsByYear(CURRENT_YEAR)
    .filter((school) => scope === "national" || normalizeKey(school.county) === county)
    .map((school) => {
      const alerts = getHartaEduAlerts(school.county, school.schoolName);
      return {
        school,
        alerts,
        urgency: Math.max(0, ...alerts.map((alert) => urgencyRank(alert.urgency))),
      };
    })
    .sort(
      (a, b) =>
        b.urgency - a.urgency ||
        b.alerts.length - a.alerts.length ||
        a.school.enAverage - b.school.enAverage ||
        b.school.graduates - a.school.graduates,
    );
}
