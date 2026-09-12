import { createFileRoute, Link } from "@tanstack/react-router";

import { Breadcrumb, NAV_LABELS } from "@/components/layout/Breadcrumb";
import { RomaniaCountyMap } from "@/components/RomaniaCountyMap";
import { CountyPerformanceLegend } from "@/components/RiskBadge";
import { Panel, PanelTitle, StatCard } from "@/components/ui/Panel";
import {
  CURRENT_YEAR,
  PREVIOUS_YEAR,
  getAllCountyStats,
  getNationalStats,
  slugify,
} from "@/lib/dataset";
import {
  formatCount,
  formatDelta,
  formatGrade,
  getCountyPerformanceColor,
  getCountyPerformanceLevel,
} from "@/lib/risk";

export const Route = createFileRoute("/national")({
  head: () => ({
    meta: [
      { title: `Situația națională ${CURRENT_YEAR} | EDUconnect` },
      {
        name: "description",
        content: "Rezultatele Evaluării Naționale pe România și pe județe.",
      },
    ],
  }),
  component: NationalDashboard,
});

function NationalDashboard() {
  const national = getNationalStats(CURRENT_YEAR);
  const nationalPrev = getNationalStats(PREVIOUS_YEAR);
  const counties = getAllCountyStats(CURRENT_YEAR);
  const delta = nationalPrev.schoolCount > 0 ? national.enAverage - nationalPrev.enAverage : null;
  const countiesAtRisk = counties.filter(
    (county) => getCountyPerformanceLevel(county.enAverage) === "rosu",
  );

  return (
    <main className="mx-auto max-w-[1320px] px-6 py-8">
      <div className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumb
            items={[{ label: NAV_LABELS.home, to: "/" }, { label: NAV_LABELS.national }]}
          />
          <h1 className="mt-3 text-balance font-display text-[44px] font-extrabold leading-none tracking-tight">
            Situația națională {CURRENT_YEAR}
          </h1>
          <p className="mt-2 max-w-[52ch] text-pretty text-lg text-sub">
            Rezultatele Evaluării Naționale, agregate din CSV-ul școlilor
          </p>
        </div>
        <CountyPerformanceLegend />
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <StatCard
          label="Media EN · România"
          value={formatGrade(national.enAverage)}
          hint={
            delta === null
              ? "fără comparație națională completă pentru anul anterior"
              : `față de ${PREVIOUS_YEAR}`
          }
          trailing={
            delta === null ? null : (
              <span
                className={`mb-2 text-lg font-semibold ${delta >= 0 ? "text-risk-grn" : "text-risk-red"}`}
              >
                {formatDelta(delta)}
              </span>
            )
          }
        />
        <StatCard
          label="Școli incluse"
          value={formatCount(national.schoolCount)}
          hint={`din ${national.countyCount} județe cu date`}
        />
        <StatCard
          label="Județe cu rezultate scăzute"
          value={countiesAtRisk.length}
          valueClassName="text-risk-red"
          hint="medie județeană sub 6,20"
        />
      </section>

      <section className="mt-5 grid grid-cols-12 gap-5">
        <Panel className="col-span-12 lg:col-span-9">
          <PanelTitle meta={`Media EN · ${CURRENT_YEAR}`}>Harta pe județe</PanelTitle>
          <RomaniaCountyMap counties={counties} nationalAverage={national.enAverage} />
          <p className="mt-3 text-sm font-medium text-sub">
            Selectează un județ pentru detalii și căutarea școlilor
          </p>
        </Panel>

        <Panel className="col-span-12 lg:col-span-3">
          <PanelTitle>Medii județene scăzute</PanelTitle>
          <ul className="mt-4">
            {countiesAtRisk.map((county, index) => {
              const performance = getCountyPerformanceColor(county.enAverage);

              return (
                <li key={county.county} className="border-b border-line last:border-b-0">
                  <Link
                    to="/county/$county"
                    params={{ county: slugify(county.county) }}
                    className="flex items-center gap-3 py-3 transition-colors hover:text-brand"
                  >
                    <span className="w-5 font-mono text-xs text-sub">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-lg font-semibold">{county.county}</span>
                    <span
                      className={`ml-auto font-display text-2xl font-extrabold ${performance?.textClass ?? ""}`}
                      title={performance?.label}
                    >
                      {formatGrade(county.enAverage)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      </section>
    </main>
  );
}
