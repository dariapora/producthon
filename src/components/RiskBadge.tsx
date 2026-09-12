import {
  RISK_LEVELS,
  getCountyPerformanceColor,
  getSchoolPerformanceColor,
  performanceMetaByLevel,
  type PerformanceScale,
  type RiskLevel,
} from "@/lib/risk";

type Props = {
  /** media EN (județ sau școală, în funcție de scală) */
  average?: number | null | undefined;
  scale: PerformanceScale;
  level?: RiskLevel;
  size?: "sm" | "md";
  showRange?: boolean;
};

export function PerformanceBadge({ average, scale, level, size = "md", showRange = false }: Props) {
  const meta = level
    ? performanceMetaByLevel(scale, level)
    : scale === "county"
      ? getCountyPerformanceColor(average)
      : getSchoolPerformanceColor(average);
  if (!meta) return null;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md pl-2 pr-3 font-semibold ${meta.badgeClass} ${
        size === "sm" ? "py-1 text-sm" : "py-1.5 text-sm"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`} />
      {showRange ? `${meta.range}, ${meta.label}` : meta.label}
    </span>
  );
}

/** Legendă pentru harta județelor (scala relativă, praguri 6,20 / 6,70). */
export function CountyPerformanceLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {RISK_LEVELS.map((level) => (
        <PerformanceBadge key={level} scale="county" level={level} showRange />
      ))}
    </div>
  );
}

/** Legendă pentru harta școlilor (scala absolută, praguri 5 / 7). */
export function SchoolPerformanceLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {RISK_LEVELS.map((level) => (
        <PerformanceBadge key={level} scale="school" level={level} showRange />
      ))}
    </div>
  );
}
