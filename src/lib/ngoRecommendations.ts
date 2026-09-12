/**
 * Motorul de recomandare a organizațiilor pentru o școală.
 *
 * Principii:
 *  - folosește exclusiv câmpurile de clasificare livrate cu datasetul ONG
 *    („Categorii relevante”, „Tip intervenție”, „Motiv relevanță”);
 *  - nevoile HartaEdu doar prioritizează tipul de intervenție, nu garantează
 *    că organizația oferă exact resursa cerută;
 *  - scorul rămâne explicabil: domeniu/nevoi (50) + proximitate (30) + relevanță
 *    generală pentru educație/copii (20).
 */
import { ngos } from "@/lib/dataset";
import { getHartaEduAlerts } from "@/lib/hartaedu";
import { haversineKm } from "@/lib/distance";
import type { Ngo, School } from "@/lib/model";

export const INTERVENTION_TYPES = [
  "Educație/meditații",
  "Consiliere copii",
  "Sprijin financiar/material rural",
] as const;

export type InterventionType = (typeof INTERVENTION_TYPES)[number];

export type RecommendationLabel = "Recomandat" | "Potrivit" | "Alternativă";

export type NgoRecommendation = {
  ngo: Ngo;
  score: number;
  label: RecommendationLabel;
  distanceKm: number | null;
  sameCounty: boolean;
  sameLocality: boolean;
  matchedNeeds: InterventionType[];
  scoreBreakdown: {
    activity: number;
    proximity: number;
    relevance: number;
  };
};

export type RecommendationResult = {
  recommendations: NgoRecommendation[];
  neededInterventions: InterventionType[];
  expandedBeyondCounty: boolean;
};

const RECOMMENDATION_LIMIT = 100;

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function sameLocality(ngo: Ngo, school: School): boolean {
  if (!school.locality) return false;
  const ngoLocality = normalize(ngo.locality)
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const schoolLocality = normalize(school.locality)
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (!ngoLocality || !schoolLocality) return false;
  return (
    ngoLocality === schoolLocality ||
    ngoLocality.startsWith(`${schoolLocality} `) ||
    ngoLocality.endsWith(` ${schoolLocality}`)
  );
}

/** Statusuri considerate potrivite pentru recomandare. */
export function isEligible(ngo: Ngo): boolean {
  const status = normalize(ngo.status).trim();
  return status === "inregistrat" || status === "activ" || status === "activa";
}

const NEED_RULES: { type: InterventionType; keywords: string[] }[] = [
  {
    type: "Educație/meditații",
    keywords: [
      "educat",
      "meditat",
      "remedial",
      "remedier",
      "sprijin scolar",
      "invat",
      "scolar",
      "digitaliz",
    ],
  },
  {
    type: "Consiliere copii",
    keywords: [
      "consiliere",
      "suport emotional",
      "emotional",
      "psiholog",
      "copii vulnerabili",
      "abandon",
    ],
  },
  {
    type: "Sprijin financiar/material rural",
    keywords: [
      "sprijin financiar",
      "material",
      "dotar",
      "echipament",
      "rural",
      "mobilier",
      "reabilitare",
    ],
  },
];

/** Traduce nevoile HartaEdu în tipuri de intervenție prioritare. */
export function mapNeedsToInterventions(needTexts: string[]): InterventionType[] {
  const found = new Set<InterventionType>();
  for (const text of needTexts) {
    const value = normalize(text);
    for (const rule of NEED_RULES) {
      if (rule.keywords.some((keyword) => value.includes(keyword))) found.add(rule.type);
    }
  }
  return INTERVENTION_TYPES.filter((type) => found.has(type));
}

function labelFor(score: number): RecommendationLabel {
  if (score >= 80) return "Recomandat";
  if (score >= 60) return "Potrivit";
  return "Alternativă";
}

function proximityPoints(
  distanceKm: number | null,
  sameCounty: boolean,
  isSameLocality: boolean,
): number {
  if (isSameLocality) return 30;
  if (distanceKm === null) return sameCounty ? 18 : 5;
  if (distanceKm <= 25) return 30;
  if (distanceKm <= 50) return 24;
  if (distanceKm <= 100) return 18;
  if (distanceKm <= 200) return 12;
  return 6;
}

export function getSchoolRecommendations(school: School): RecommendationResult {
  const alerts = getHartaEduAlerts(school.county, school.schoolName);
  const needTexts = alerts.flatMap((alert) => [alert.category, ...alert.needs]);
  const neededInterventions = mapNeedsToInterventions(needTexts);

  const schoolPoint =
    school.latitude !== null && school.longitude !== null
      ? { latitude: school.latitude, longitude: school.longitude }
      : null;

  const scored = ngos.filter(isEligible).map<NgoRecommendation>((ngo) => {
    const sameCounty = normalize(ngo.county) === normalize(school.county);
    const isSameLocality = sameLocality(ngo, school);
    const distanceKm =
      schoolPoint && ngo.latitude !== null && ngo.longitude !== null
        ? haversineKm(schoolPoint, { latitude: ngo.latitude, longitude: ngo.longitude })
        : null;

    const categories = ngo.relevantCategories.map(normalize);
    const matchedNeeds = neededInterventions.filter((need) =>
      categories.some((category) => category === normalize(need)),
    );

    // 50 puncte — potrivirea cu nevoile raportate în HartaEdu
    let needPoints = 0;
    if (neededInterventions.length > 0) {
      needPoints = Math.round((matchedNeeds.length / neededInterventions.length) * 50);
    } else {
      // fără nevoi raportate, se acordă un scor de bază celor relevante pentru educație
      needPoints = categories.length > 0 ? 30 : 0;
    }

    // 20 puncte — relevanță generală pentru educație / copii
    const generalPoints = categories.some(
      (category) => category.includes("educat") || category.includes("copii"),
    )
      ? 20
      : 8;

    const proximity = proximityPoints(distanceKm, sameCounty, isSameLocality);
    const scoreBreakdown = {
      activity: needPoints,
      proximity,
      relevance: generalPoints,
    };
    const score = Math.min(100, needPoints + proximity + generalPoints);

    return {
      ngo,
      score,
      label: labelFor(score),
      distanceKm,
      sameCounty,
      sameLocality: isSameLocality,
      matchedNeeds,
      scoreBreakdown,
    };
  });

  const sorted = sortRecommendations(scored, "recomandate");
  const inCounty = sorted.filter((item) => item.sameCounty);
  const expandedBeyondCounty = inCounty.length < 3 && sorted.length > inCounty.length;
  const recommendations = (expandedBeyondCounty ? sorted : inCounty).slice(0, RECOMMENDATION_LIMIT);

  return { recommendations, neededInterventions, expandedBeyondCounty };
}

export type SortMode = "recomandate" | "apropiate" | "alfabetic";

export function sortRecommendations(
  items: NgoRecommendation[],
  mode: SortMode,
): NgoRecommendation[] {
  const list = [...items];
  if (mode === "alfabetic") {
    return list.sort((a, b) => a.ngo.name.localeCompare(b.ngo.name, "ro"));
  }
  if (mode === "apropiate") {
    return list.sort(
      (a, b) =>
        (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER),
    );
  }
  return list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.sameLocality !== b.sameLocality) return a.sameLocality ? -1 : 1;
    if (a.sameCounty !== b.sameCounty) return a.sameCounty ? -1 : 1;
    return (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER);
  });
}

/** Text afișat când distanța nu poate fi calculată. */
export function locationFallback(ngo: Ngo): string {
  if (ngo.county.trim().length > 0) return `În județul ${ngo.county}`;
  return "Localitate necunoscută";
}
