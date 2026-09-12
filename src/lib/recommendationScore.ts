export type RecommendationScoreLevel = "high" | "medium" | "low";

export function recommendationScoreLevel(score: number): RecommendationScoreLevel {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

export function recommendationScoreColor(score: number): string {
  const level = recommendationScoreLevel(score);
  if (level === "high") return "#067647";
  if (level === "medium") return "#8a6100";
  return "#b42318";
}
