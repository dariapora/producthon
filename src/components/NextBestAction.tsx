/**
 * Cardul „Ce poți face acum?” — recomandarea principală pentru director.
 * O singură acțiune primară, motive explicabile, fără promisiuni de impact.
 */
import { Link } from "@tanstack/react-router";

import { getNextBestAction } from "@/lib/nextBestAction";
import { formatCount, formatGrade } from "@/lib/risk";
import type { CountyStats, School } from "@/lib/model";

export function NextBestActionSection({
  school,
  county,
}: {
  school: School;
  county: CountyStats | null;
}) {
  const action = getNextBestAction(school, county);

  const cta =
    action.cta.kind === "support" ? (
      <Link
        to="/school/$schoolId/support"
        params={{ schoolId: school.id }}
        className="inline-flex min-h-14 items-center rounded-md bg-card px-7 py-4 text-lg font-bold text-brand"
      >
        {action.cta.label}
      </Link>
    ) : (
      <a
        href={action.cta.alertId ? `#${action.cta.alertId}` : "#hartaedu"}
        className="inline-flex min-h-14 items-center rounded-md bg-card px-7 py-4 text-lg font-bold text-brand"
      >
        {action.cta.label}
      </a>
    );

  return (
    <section className="mt-8" aria-labelledby="next-action-title">
      <h2 id="next-action-title" className="font-display text-[28px] font-extrabold tracking-tight">
        Ce poți face acum?
      </h2>
      <div className="mt-5 rounded-md bg-brand p-7 text-card md:p-9">
        <p className="mt-3 max-w-[30ch] text-balance font-display text-[30px] font-extrabold leading-[1.12] tracking-tight md:text-[36px]">
          {action.headline}
        </p>
        <p className="mt-3 max-w-[62ch] text-lg leading-relaxed text-card/90">{action.summary}</p>

        <dl
          className={`mt-6 grid grid-cols-2 gap-4 ${
            action.metrics.alertCount > 0 ? "md:grid-cols-4" : "md:grid-cols-3"
          }`}
        >
          <Metric label="Media EN" value={formatGrade(action.metrics.enAverage)} />
          <Metric
            label="vs județ"
            value={
              action.metrics.countyAverage !== null
                ? formatGrade(action.metrics.countyAverage)
                : "fără date"
            }
          />
          <Metric label="ONG-uri relevante" value={formatCount(action.metrics.relevantNgos)} />
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-5">{cta}</div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-card/30 bg-card/10 px-4 py-3">
      <dt className="text-sm font-semibold text-card/80">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-extrabold leading-none">{value}</dd>
    </div>
  );
}
