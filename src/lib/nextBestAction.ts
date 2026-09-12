/**
 * „Ce poți face acum?” — motor determinist de recomandare pentru director.
 *
 * Reguli explicabile, fără AI, doar din datele reale:
 *  1. alertă HartaEdu „Foarte urgentă”      → prioritate maximă
 *  2. media EN a școlii sub 5               → sprijin pentru elevi
 *  3. școala semnificativ sub media județului (≤ −0,5)
 *  4. alte nevoi HartaEdu raportate
 *  5. există ONG-uri relevante
 *  6. niciun ONG relevant → extindere regională / națională
 *
 * Niciodată nu afirmă cauzalitate sau impact garantat.
 */
import { getHartaEduAlerts, type HartaEduAlert } from "@/lib/hartaedu";
import { getSchoolRecommendations } from "@/lib/ngoRecommendations";
import { formatCount, formatGrade } from "@/lib/risk";
import type { CountyStats, School } from "@/lib/model";

export type NextActionCta =
  | { kind: "support"; label: string }
  | { kind: "hartaedu"; label: string; alertId?: string };

export type NextBestAction = {
  /** Titlul recomandării, generat din date. */
  headline: string;
  /** Fraza explicativă de sub titlu. */
  summary: string;
  cta: NextActionCta;
  reasons: string[];
  metrics: {
    enAverage: number;
    countyAverage: number | null;
    alertCount: number;
    impactedStudents: number;
    relevantNgos: number;
    nearbyNgos: number;
  };
  alerts: HartaEduAlert[];
};

const VERY_URGENT = "foarte urgenta";

function isVeryUrgent(alert: HartaEduAlert): boolean {
  return alert.urgency
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .includes(VERY_URGENT);
}

export function getNextBestAction(
  school: School,
  county: CountyStats | null,
): NextBestAction {
  const alerts = getHartaEduAlerts(school.county, school.schoolName);
  const { recommendations } = getSchoolRecommendations(school);
  const relevant = recommendations.filter((item) => item.label !== "Alternativă");
  const nearby = relevant.filter(
    (item) => item.distanceKm !== null && item.distanceKm <= 25,
  );
  const impactedStudents = alerts.reduce((sum, alert) => sum + alert.impactedStudents, 0);

  const urgentAlert = alerts.find(isVeryUrgent) ?? null;
  const belowThreshold = school.enAverage < 5;
  const countyDiff = county ? school.enAverage - county.enAverage : null;
  const belowCounty = countyDiff !== null && countyDiff <= -0.5;

  const reasons: string[] = [];
  if (urgentAlert) reasons.push("Există o nevoie HartaEdu marcată ca foarte urgentă.");
  if (belowThreshold) reasons.push("Media EN a școlii este sub pragul de 5.");
  if (belowCounty && county) {
    reasons.push(
      `Media EN este cu ${formatGrade(Math.abs(countyDiff))} puncte sub media județului ${school.county}.`,
    );
  }
  if (!urgentAlert && alerts.length > 0) reasons.push("Există nevoi HartaEdu raportate pentru această școală.");
  if (relevant.length > 0) reasons.push("Există ONG-uri care oferă tipul de sprijin relevant.");
  if (reasons.length === 0) reasons.push("Rezultatele școlii nu indică o urgență evidentă în datele disponibile.");

  const metrics = {
    enAverage: school.enAverage,
    countyAverage: county?.enAverage ?? null,
    alertCount: alerts.length,
    impactedStudents,
    relevantNgos: relevant.length,
    nearbyNgos: nearby.length,
  };

  // — Ordinea de prioritate din specificație —
  if (urgentAlert) {
    return {
      headline: "Prioritate imediată",
      summary: `Există cel puțin o nevoie marcată ca foarte urgentă în HartaEdu (${urgentAlert.category.toLowerCase()}, ${formatCount(urgentAlert.impactedStudents)} elevi impactați). Merită verificată înainte de orice altă acțiune.`,
      cta: { kind: "hartaedu", label: "Vezi nevoia", alertId: urgentAlert.id },
      reasons,
      metrics,
      alerts,
    };
  }

  if (belowThreshold) {
    return {
      headline: "Prioritate: sprijin pentru elevi",
      summary: `Media școlii este sub pragul de 5 (${formatGrade(school.enAverage)}). Poți căuta organizații care oferă sprijin educațional, remedial sau consiliere pentru elevi.`,
      cta: { kind: "support", label: "Găsește sprijin educațional" },
      reasons,
      metrics,
      alerts,
    };
  }

  if (belowCounty) {
    return {
      headline: `Școala este cu ${formatGrade(Math.abs(countyDiff!))} puncte sub media județului`,
      summary: "Merită să prioritizezi intervențiile care pot susține elevii și profesorii. Căutarea unei organizații partenere poate fi un punct de pornire.",
      cta: { kind: "support", label: "Vezi ONG-urile recomandate" },
      reasons,
      metrics,
      alerts,
    };
  }

  if (alerts.length > 0) {
    return {
      headline: "Există nevoi raportate pentru această școală",
      summary: `${alerts.length === 1 ? "O nevoie raportată" : `${alerts.length} nevoi raportate`} · ${formatCount(impactedStudents)} elevi impactați. Tipul de intervenție declarat de unele organizații poate fi compatibil cu aceste nevoi.`,
      cta: { kind: "hartaedu", label: "Vezi nevoile" },
      reasons,
      metrics,
      alerts,
    };
  }

  if (relevant.length > 0) {
    return {
      headline: "Am identificat ONG-uri relevante pentru această școală",
      summary: `${formatCount(relevant.length)} ${relevant.length === 1 ? "organizație relevantă" : "organizații relevante"}${nearby.length > 0 ? `, ${nearby.length} la mai puțin de 25 km` : ""}. Merită contactate pentru a discuta despre sprijin.`,
      cta: { kind: "support", label: "Vezi ONG-urile recomandate" },
      reasons,
      metrics,
      alerts,
    };
  }

  return {
    headline: "Nu am identificat momentan ONG-uri potrivite în zona apropiată",
    summary: "Poți extinde căutarea la nivel regional sau național.",
    cta: { kind: "support", label: "Vezi mai multe ONG-uri" },
    reasons,
    metrics,
    alerts,
  };
}
