import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PerformanceBadge } from "@/components/RiskBadge";
import { SchoolSearch } from "@/components/SchoolSearch";
import { EmptyState, Panel, PanelTitle, StatCard } from "@/components/ui/Panel";
import {
  CURRENT_YEAR,
  PREVIOUS_YEAR,
  getCountyStats,
  getNationalStats,
  getNgosByCounty,
  getSchoolsInCounty,
} from "@/lib/dataset";
import { hasHartaEduAlerts } from "@/lib/hartaedu";
import type { School } from "@/lib/model";
import { formatCount, formatDelta, formatGrade, getCountyPerformanceColor } from "@/lib/risk";

const SCHOOLS_PER_PAGE = 10;

type Props = {
  county: string;
  variant?: "page" | "embedded";
};

export function CountySituationPanel({ county, variant = "page" }: Props) {
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
  const flaggedCount = schools.filter((s) => hasHartaEduAlerts(s.county, s.schoolName)).length;

  return (
    <div className={variant === "embedded" ? "mt-6" : undefined}>
      {variant === "embedded" ? (
        <h3 className="font-display text-2xl font-bold">Județul {county}</h3>
      ) : null}

      <section
        className={`grid gap-5 md:grid-cols-2 xl:grid-cols-4 ${variant === "embedded" ? "mt-5" : "mt-8"}`}
      >
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
        <Panel className="col-span-12">
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
    </div>
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
