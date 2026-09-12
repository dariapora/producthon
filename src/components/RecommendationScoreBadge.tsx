import type { RecommendationLabel } from "@/lib/ngoRecommendations";
import { recommendationScoreLevel } from "@/lib/recommendationScore";

function tone(score: number): string {
  const level = recommendationScoreLevel(score);
  if (level === "high") return "border-risk-grn/30 bg-risk-grn-bg text-risk-grn";
  if (level === "medium") return "border-risk-yel/30 bg-risk-yel-bg text-risk-yel";
  return "border-risk-red/30 bg-risk-red-bg text-risk-red";
}

export function RecommendationScoreBadge({
  score,
  label,
  size = "md",
}: {
  score: number;
  label: RecommendationLabel;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-baseline gap-1.5 rounded-md border font-semibold ${tone(score)} ${
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-2 text-sm"
      }`}
      aria-label={`${label}, scor ${score} din 100`}
    >
      <strong className={size === "sm" ? "text-base" : "text-xl"}>{score}</strong>
      <span>/100 · {label}</span>
    </span>
  );
}
