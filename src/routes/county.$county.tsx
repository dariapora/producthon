import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Breadcrumb, NAV_LABELS } from "@/components/layout/Breadcrumb";
import {
  CountyPerformanceLegend,
  PerformanceBadge,
  SchoolPerformanceLegend,
} from "@/components/RiskBadge";
import { SchoolSearch } from "@/components/SchoolSearch";
import { EmptyState, Panel, PanelTitle, StatCard } from "@/components/ui/Panel";
import {
  CURRENT_YEAR,
  PREVIOUS_YEAR,
  getCountyBySlug,
  getCountyStats,
  getMappableSchoolsInCounty,
  getNationalStats,
  getNgosByCounty,
  getPreviousYearAverage,
  getSchoolsInCounty,
} from "@/lib/dataset";
import { hasHartaEduAlerts } from "@/lib/hartaedu";
import type { School } from "@/lib/model";
import { formatCount, formatDelta, formatGrade, getCountyPerformanceColor } from "@/lib/risk";

const SCHOOLS_PER_PAGE = 10;

export const Route = createFileRoute("/county/$county")({
  loader: ({ params }) => {
    const county = getCountyBySlug(params.county);
    if (!county) throw notFound();
    return { county };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Județ indisponibil | EDUconnect" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `Județul ${loaderData.county} | Evaluarea Națională | EDUconnect`;
    const description = `Media la Evaluarea Națională în județul ${loaderData.county}, școlile sub prag și ONG-urile din zonă.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CountyDashboard,
});

function CountyDashboard() {
  const { county } = Route.useLoaderData();
  const stats = getCountyStats(county, CURRENT_YEAR);
  const prev = getCountyStats(county, PREVIOUS_YEAR);
  const national = getNationalStats(CURRENT_YEAR);
  const schools = getSchoolsInCounty(county, CURRENT_YEAR);
  const ngos = getNgosByCounty(county);
  const visibleNgos = ngos.slice(0, 8);

  const delta = stats && prev ? stats.enAverage - prev.enAverage : null;
  const vsNational = stats ? stats.enAverage - national.enAverage : null;
  const countyPerformance = getCountyPerformanceColor(stats?.enAverage);
  const nationalPerformance = getCountyPerformanceColor(national.enAverage);
  const mappable = getMappableSchoolsInCounty(county, CURRENT_YEAR);
  const previousAverages = Object.fromEntries(
    mappable.map((s) => [s.id, getPreviousYearAverage(s)]),
  );
  const flaggedCount = schools.filter((s) => hasHartaEduAlerts(s.county, s.schoolName)).length;

  return (
    <main className="mx-auto max-w-[1320px] px-6 py-8">
      <div className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: NAV_LABELS.home, to: "/" },
              { label: NAV_LABELS.national, to: "/national" },
              { label: `Județul ${county}` },
            ]}
          />
          <h1 className="mt-3 font-display text-[44px] font-extrabold leading-none tracking-tight">
            Județul {county}
          </h1>
          <p className="mt-2 max-w-[52ch] text-pretty text-lg text-sub">
            Rezultatele Evaluării Naționale {CURRENT_YEAR}
          </p>
        </div>
        <CountyPerformanceLegend />
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Media EN · ${county}`}
          value={formatGrade(stats?.enAverage)}
          className={countyPerformance?.bgClass}
          labelClassName={countyPerformance?.textClass}
          valueClassName={countyPerformance?.textClass}
          hint={
            <span
              className={`font-semibold ${
                delta === null ? "text-risk-yel" : delta >= 0 ? "text-risk-grn" : "text-risk-red"
              }`}
            >
              față de {PREVIOUS_YEAR}: {formatDelta(delta)}
            </span>
          }
        />
        <StatCard
          label="Media EN · România"
          value={formatGrade(national.enAverage)}
          className={nationalPerformance?.bgClass}
          labelClassName={nationalPerformance?.textClass}
          valueClassName={nationalPerformance?.textClass}
          hint={
            <span
              className={`font-semibold ${
                vsNational === null
                  ? "text-risk-yel"
                  : vsNational >= 0
                    ? "text-risk-grn"
                    : "text-risk-red"
              }`}
            >
              {vsNational === null
                ? "comparație indisponibilă"
                : vsNational >= 0
                  ? "județul este peste media națională"
                  : "județul este sub media națională"}
            </span>
          }
        />
        <StatCard
          label="Școli"
          value={formatCount(schools.length)}
          className="border-risk-grn bg-risk-grn-bg"
          labelClassName="text-risk-grn"
          valueClassName="text-risk-grn"
          hint={<span className="font-semibold text-risk-grn">cu rezultate raportate</span>}
        />
        <StatCard
          label="Absolvenți"
          value={formatCount(stats?.graduates ?? 0)}
          className="border-risk-grn bg-risk-grn-bg"
          labelClassName="text-risk-grn"
          valueClassName="text-risk-grn"
          hint={<span className="font-semibold text-risk-grn">evaluați în {CURRENT_YEAR}</span>}
        />
      </section>

      <section className="mt-5 grid grid-cols-12 gap-5">
        <Panel className={`col-span-12`}>
          <PanelTitle>Găsește-ți școala</PanelTitle>
          <div className="mt-4">
            <SchoolSearch county={county} />
          </div>
          <div className="mt-5 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            <p className="text-sm text-sub">
              {formatCount(flaggedCount)} școli cu nevoi raportate pe HartaEdu
            </p>
          </div>
        </Panel>
      </section>

      <section className="mt-5 grid grid-cols-12 items-start gap-5">
        <SchoolListPanel key={county} schools={schools} />

        <Panel className="col-span-12 lg:col-span-4">
          <PanelTitle>ONG-uri din județ</PanelTitle>
          <p className="mt-1 text-sm font-medium text-sub">
            {county} · {formatCount(ngos.length)} organizații
          </p>
          {ngos.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Nicio organizație în dataset pentru acest județ" />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {visibleNgos.map((n) => (
                <li key={n.id}>
                  <Link
                    to="/ngo/$ngoId"
                    params={{ ngoId: n.id }}
                    className="block min-h-14 rounded-md border border-line bg-paper px-4 py-3 hover:border-sub"
                  >
                    <p className="font-semibold">{n.name}</p>
                    <p className="mt-1 text-sm text-sub">
                      {n.interventionType} · {n.locality}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {ngos.length > visibleNgos.length && (
            <p className="mt-4 text-sm text-sub">
              Sunt afișate primele {formatCount(visibleNgos.length)} din {formatCount(ngos.length)}{" "}
              organizații active. Recomandările relevante apar după selectarea unei școli.
            </p>
          )}
        </Panel>
      </section>
    </main>
  );
}

function SchoolListPanel({ schools }: { schools: School[] }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(schools.length / SCHOOLS_PER_PAGE));
  const visibleSchools = schools.slice(page * SCHOOLS_PER_PAGE, (page + 1) * SCHOOLS_PER_PAGE);

  return (
    <Panel className="col-span-12 lg:col-span-8">
      <PanelTitle meta="ordonate crescător după media EN">Școli din județ</PanelTitle>
      <ul className="mt-4">
        {visibleSchools.map((school) => (
          <li key={school.id} className="border-b border-line last:border-b-0">
            <Link
              to="/school/$schoolId"
              params={{ schoolId: school.id }}
              className="flex flex-wrap items-center gap-3 py-3 transition-colors hover:text-brand"
            >
              <span>
                <span className="block text-lg font-semibold">{school.schoolName}</span>
                <span className="block text-sm text-sub">
                  {school.locality ?? "Localitate necunoscută"} · {formatCount(school.graduates)}{" "}
                  absolvenți
                </span>
              </span>
              <span className="ml-auto font-display text-2xl font-extrabold">
                {formatGrade(school.enAverage)}
              </span>
              <PerformanceBadge average={school.enAverage} scale="school" size="sm" />
            </Link>
          </li>
        ))}
      </ul>

      {pageCount > 1 ? (
        <nav
          aria-label="Navigare pagini școli"
          className="mt-5 flex items-center justify-between border-t border-line pt-4"
        >
          <button
            type="button"
            aria-label="Pagina anterioară"
            disabled={page === 0}
            onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
            className="grid size-11 place-items-center rounded-md border-2 border-line text-brand transition-colors hover:border-sub disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft size={22} aria-hidden />
          </button>
          <p className="text-sm font-semibold text-sub" aria-live="polite">
            Pagina {page + 1} din {pageCount}
          </p>
          <button
            type="button"
            aria-label="Pagina următoare"
            disabled={page === pageCount - 1}
            onClick={() => setPage((currentPage) => Math.min(pageCount - 1, currentPage + 1))}
            className="grid size-11 place-items-center rounded-md border-2 border-line text-brand transition-colors hover:border-sub disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight size={22} aria-hidden />
          </button>
        </nav>
      ) : null}
    </Panel>
  );
}
