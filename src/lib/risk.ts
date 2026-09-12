/**
 * Clasificarea rezultatelor la Evaluarea Națională.
 *
 * Folosim INTENȚIONAT două scale diferite:
 *  - JUDEȚ  → performanță relativă, raportată la distribuția reală a mediilor
 *             județene din datasetul 2026 (medie ponderată cu numărul de elevi).
 *  - ȘCOALĂ → performanță absolută a școlii.
 *
 * Pragurile de județ nu se folosesc niciodată pentru școli și invers.
 * Datele HartaEdu (nevoi raportate) NU influențează aceste culori.
 */

export type RiskLevel = "rosu" | "galben" | "verde";
export type PerformanceScale = "county" | "school";

export type PerformanceMeta = {
  level: RiskLevel;
  scale: PerformanceScale;
  /** eticheta afișată, diferită între scale */
  label: string;
  /** intervalul scalei, pentru legendă */
  range: string;
  description: string;
  textClass: string;
  bgClass: string;
  dotClass: string;
  badgeClass: string;
  /** umplere SVG pentru hărți */
  mapClass: string;
  /** culoare brută, pentru markere SVG */
  color: string;
};

/** Praguri județ: roșu < 6,20; galben 6,20–6,70; verde > 6,70. */
export const COUNTY_THRESHOLDS = { red: 6.2, green: 6.7 } as const;
/** Praguri școală: roșu < 5; galben 5–6,99; verde >= 7. */
export const SCHOOL_THRESHOLDS = { red: 5, green: 7 } as const;

const PALETTE: Record<
  RiskLevel,
  Omit<PerformanceMeta, "level" | "scale" | "label" | "range" | "description">
> = {
  rosu: {
    textClass: "text-risk-red",
    bgClass: "bg-risk-red-bg",
    dotClass: "bg-risk-red",
    badgeClass: "bg-risk-red-bg text-risk-red",
    mapClass: "fill-risk-red",
    color: "#b42318",
  },
  galben: {
    textClass: "text-risk-yel",
    bgClass: "bg-risk-yel-bg",
    dotClass: "bg-risk-yel",
    badgeClass: "bg-risk-yel-bg text-risk-yel",
    mapClass: "fill-risk-yel",
    color: "#8a6100",
  },
  verde: {
    textClass: "text-risk-grn",
    bgClass: "bg-risk-grn-bg",
    dotClass: "bg-risk-grn",
    badgeClass: "bg-risk-grn-bg text-risk-grn",
    mapClass: "fill-risk-grn",
    color: "#067647",
  },
};

const COUNTY_META: Record<RiskLevel, PerformanceMeta> = {
  rosu: {
    ...PALETTE.rosu,
    level: "rosu",
    scale: "county",
    label: "Rezultate scăzute",
    range: "Sub 6,20",
    description: "Sub nivelul majorității județelor",
  },
  galben: {
    ...PALETTE.galben,
    level: "galben",
    scale: "county",
    label: "Rezultate medii",
    range: "6,20–6,70",
    description: "În jurul nivelului majorității județelor",
  },
  verde: {
    ...PALETTE.verde,
    level: "verde",
    scale: "county",
    label: "Rezultate bune",
    range: "Peste 6,70",
    description: "Peste nivelul majorității județelor",
  },
};

const SCHOOL_META: Record<RiskLevel, PerformanceMeta> = {
  rosu: {
    ...PALETTE.rosu,
    level: "rosu",
    scale: "school",
    label: "Sub prag",
    range: "Sub 5",
    description: "Media EN a școlii este sub 5,00",
  },
  galben: {
    ...PALETTE.galben,
    level: "galben",
    scale: "school",
    label: "Rezultate medii",
    range: "5–6,99",
    description: "Media EN a școlii este între 5,00 și 6,99",
  },
  verde: {
    ...PALETTE.verde,
    level: "verde",
    scale: "school",
    label: "Rezultate bune",
    range: "7+",
    description: "Media EN a școlii este 7,00 sau peste",
  },
};

function isValid(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && Number.isFinite(value);
}

/** Nivelul de performanță pentru media ponderată a unui județ. */
export function getCountyPerformanceLevel(average: number | null | undefined): RiskLevel | null {
  if (!isValid(average)) return null;
  if (average < COUNTY_THRESHOLDS.red) return "rosu";
  if (average <= COUNTY_THRESHOLDS.green) return "galben";
  return "verde";
}

/** Nivelul de performanță pentru media unei școli. */
export function getSchoolPerformanceLevel(average: number | null | undefined): RiskLevel | null {
  if (!isValid(average)) return null;
  if (average < SCHOOL_THRESHOLDS.red) return "rosu";
  if (average < SCHOOL_THRESHOLDS.green) return "galben";
  return "verde";
}

/** Culoarea + eticheta pentru un județ (scala relativă). */
export function getCountyPerformanceColor(
  average: number | null | undefined,
): PerformanceMeta | null {
  const level = getCountyPerformanceLevel(average);
  return level ? COUNTY_META[level] : null;
}

/** Culoarea + eticheta pentru o școală (scala absolută). */
export function getSchoolPerformanceColor(
  average: number | null | undefined,
): PerformanceMeta | null {
  const level = getSchoolPerformanceLevel(average);
  return level ? SCHOOL_META[level] : null;
}

export function performanceMetaByLevel(scale: PerformanceScale, level: RiskLevel): PerformanceMeta {
  return scale === "county" ? COUNTY_META[level] : SCHOOL_META[level];
}

export const RISK_LEVELS: RiskLevel[] = ["rosu", "galben", "verde"];

/** Format românesc: 6,42 */
export function formatGrade(value: number | null | undefined): string {
  if (!isValid(value)) return "N/A";
  return value.toFixed(2).replace(".", ",");
}

export function formatDelta(value: number | null | undefined): string {
  if (!isValid(value)) return "N/A";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "±";
  return `${sign}${Math.abs(value).toFixed(2).replace(".", ",")}`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("ro-RO").format(value);
}
