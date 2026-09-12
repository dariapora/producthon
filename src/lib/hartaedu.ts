/**
 * Strat contextual HartaEdu.
 *
 * Răspunde la „Ce nevoi au fost raportate pentru această școală?”.
 * NU se combină niciodată cu scorul / culoarea de risc din Evaluarea Națională.
 *
 * Potrivirea cu datasetul EN se face pe județ + numele normalizat al școlii,
 * astfel încât setul demonstrativ să poată fi înlocuit cu un export complet.
 */
import { hartaEduAlerts, type HartaEduAlertRow } from "@/data/raw/hartaEduAlerts";
import { normalizeKey } from "@/data/enrichment/localityCoordinates";

export type HartaEduAlert = {
  id: string;
  county: string;
  schoolName: string;
  locality: string;
  category: string;
  urgency: string;
  impactedStudents: number;
  needs: string[];
  source: string;
  url: string;
};

export type HartaEduUrgencyTone = {
  textClass: string;
  bgClass: string;
  borderClass: string;
};

export function getHartaEduUrgencyTone(urgency: string): HartaEduUrgencyTone {
  const normalized = normalizeKey(urgency);

  if (normalized.includes("foarte urgenta")) {
    return {
      textClass: "text-risk-red",
      bgClass: "bg-risk-red-bg",
      borderClass: "border-risk-red/35",
    };
  }

  if (normalized.includes("urgenta")) {
    return {
      textClass: "text-risk-yel",
      bgClass: "bg-risk-yel-bg",
      borderClass: "border-risk-yel/35",
    };
  }

  return {
    textClass: "text-risk-grn",
    bgClass: "bg-risk-grn-bg",
    borderClass: "border-risk-grn/35",
  };
}

function matchKey(county: string, schoolName: string): string {
  return `${normalizeKey(county)}::${normalizeKey(schoolName)}`;
}

function toAlert(row: HartaEduAlertRow, index: number): HartaEduAlert {
  return {
    id: `hartaedu-${index + 1}`,
    county: row.judet,
    schoolName: row.scoala,
    locality: row.localitate,
    category: row.categorie,
    urgency: row.urgenta,
    impactedStudents: row.elevi_impactati,
    needs: row.nevoi,
    source: row.sursa,
    url: row.url,
  };
}

export const hartaEduAlertList: HartaEduAlert[] = hartaEduAlerts.map(toAlert);

const alertsByKey = new Map<string, HartaEduAlert[]>();
for (const alert of hartaEduAlertList) {
  const key = matchKey(alert.county, alert.schoolName);
  const current = alertsByKey.get(key);
  if (current) current.push(alert);
  else alertsByKey.set(key, [alert]);
}

export function getHartaEduAlerts(county: string, schoolName: string): HartaEduAlert[] {
  return alertsByKey.get(matchKey(county, schoolName)) ?? [];
}

export function hasHartaEduAlerts(county: string, schoolName: string): boolean {
  return alertsByKey.has(matchKey(county, schoolName));
}

export const HARTAEDU_EMPTY_MESSAGE =
  "Nu sunt identificate nevoi raportate în HartaEdu pentru această școală.";

export const HARTAEDU_EMPTY_NOTE = "Absența unei raportări nu înseamnă absența nevoilor.";
