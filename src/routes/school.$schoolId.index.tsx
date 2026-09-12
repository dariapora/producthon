import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronDown, Send } from "lucide-react";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { HartaEduReportDialog } from "@/components/HartaEduReportDialog";
import { PerformanceBadge } from "@/components/RiskBadge";
import { Panel, PanelTitle } from "@/components/ui/Panel";
import { getNgoById, getSchoolComparison, slugify } from "@/lib/dataset";
import {
  HARTAEDU_EMPTY_MESSAGE,
  HARTAEDU_EMPTY_NOTE,
  getHartaEduAlerts,
  getHartaEduUrgencyTone,
  type HartaEduAlert,
} from "@/lib/hartaedu";
import { formatCount, formatGrade, getSchoolPerformanceColor } from "@/lib/risk";
import { buildNgoToSchoolEmailDraft } from "@/lib/schoolEmail";
import type { SupportScope } from "@/lib/schoolSupport";
import type { CountyStats, School } from "@/lib/model";

type SchoolDetailSearch = { ngoId?: string; scope?: SupportScope };

export const Route = createFileRoute("/school/$schoolId/")({
  validateSearch: (search: Record<string, unknown>): SchoolDetailSearch => ({
    ...(typeof search.ngoId === "string" && search.ngoId.length > 0 ? { ngoId: search.ngoId } : {}),
    ...(search.scope === "county" || search.scope === "national" ? { scope: search.scope } : {}),
  }),
  loaderDeps: ({ search }) => ({ ngoId: search.ngoId, scope: search.scope }),
  loader: ({ params, deps }) => {
    const comparison = getSchoolComparison(params.schoolId);
    if (!comparison) throw notFound();
    return {
      ...comparison,
      ngo: deps.ngoId ? getNgoById(deps.ngoId) : null,
      supportScope: deps.scope ?? "county",
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Școală indisponibilă | EDUconnect" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.school.schoolName} | Evaluarea Națională | EDUconnect`;
    const description = `Rezultatele la Evaluarea Națională pentru ${loaderData.school.schoolName}, comparate cu județul ${loaderData.school.county} și cu media pe România.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: SchoolDetail,
});

/** „↓ 0,31 față de 2025” — mereu săgeată + valoare, nu doar culoare. */
function DeltaLine({ delta, label }: { delta: number; label: string }) {
  const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
  const tone = delta > 0 ? "text-risk-grn" : delta < 0 ? "text-risk-red" : "text-sub";
  return (
    <p className={`text-lg font-semibold ${tone}`}>
      <span aria-hidden>{arrow}</span> {formatGrade(Math.abs(delta))} {label}
    </p>
  );
}

function differenceSentence(diff: number, reference: string): string {
  const value = formatGrade(Math.abs(diff));
  if (Math.abs(diff) < 0.005) return `La nivelul mediei ${reference}`;
  return diff < 0
    ? `Cu ${value} puncte sub media ${reference}`
    : `Cu ${value} puncte peste media ${reference}`;
}

function SchoolDetail() {
  const { school, previousYear, county, national, ngo, supportScope } = Route.useLoaderData();
  const deltaYear = previousYear ? school.enAverage - previousYear.enAverage : null;
  const deltaCounty = county ? school.enAverage - county.enAverage : null;
  const deltaNational = school.enAverage - national.enAverage;
  const alerts = getHartaEduAlerts(school.county, school.schoolName);
  const schoolEmailDraft = ngo ? buildNgoToSchoolEmailDraft({ ngo, school, alerts }) : null;
  const meta = getSchoolPerformanceColor(school.enAverage);

  const maxValue = Math.max(school.enAverage, county?.enAverage ?? 0, national.enAverage, 1);

  return (
    <main className="mx-auto max-w-[1080px] px-6 py-8">
      {/* 1 · Identitatea școlii */}
      <header className="rise">
        <Breadcrumb
          items={
            ngo
              ? [
                  { label: "Acasă", to: "/" },
                  {
                    label: "Reprezint un ONG",
                    to: "/support",
                    search: { ngoId: ngo.id, scope: supportScope },
                  },
                  { label: school.schoolName },
                ]
              : [
                  { label: "Acasă", to: "/" },
                  { label: "Situația națională", to: "/national" },
                  {
                    label: school.county,
                    to: "/county/$county",
                    params: { county: slugify(school.county) },
                  },
                  { label: school.schoolName },
                ]
          }
        />
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="max-w-[24ch] text-balance font-display text-[44px] font-extrabold leading-[1.05] tracking-tight">
              {school.schoolName}
            </h1>
            <p className="mt-2 text-lg text-sub">
              {school.locality ? `${school.locality}, ` : ""}județul {school.county}
            </p>
            {ngo ? (
              <p className="mt-2 text-sm font-semibold text-brand">Vizualizare pentru {ngo.name}</p>
            ) : null}
          </div>
          <PerformanceBadge average={school.enAverage} scale="school" />
        </div>
      </header>

      {/* 2–5 · Rezultat compact, cu detalii la cerere */}
      <section className="mt-6">
        <Panel className="p-0">
          <div className="px-5 py-5 sm:px-6">
            <div>
              <p className="text-sm font-semibold text-sub">
                Media Evaluare Națională {school.year}
              </p>
              <div className="mt-1 flex flex-wrap items-end gap-4">
                <p
                  className={`font-display text-[52px] font-extrabold leading-none tracking-tight ${meta?.textClass ?? ""}`}
                >
                  {formatGrade(school.enAverage)}
                </p>
                {deltaYear !== null ? (
                  <div className="pb-1">
                    <DeltaLine delta={deltaYear} label={`față de ${previousYear?.year}`} />
                  </div>
                ) : (
                  <p className="pb-1 text-sm text-sub">Fără comparație cu 2025</p>
                )}
              </div>
              <p className="mt-3 text-base font-medium text-sub">
                {deltaCounty !== null
                  ? differenceSentence(deltaCounty, `județului ${school.county}`)
                  : differenceSentence(deltaNational, "națională")}
              </p>
            </div>
          </div>

          <details className="group border-t-2 border-line">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-semibold text-brand marker:hidden sm:px-6">
              Vezi detaliile rezultatelor
              <ChevronDown
                size={22}
                aria-hidden
                className="shrink-0 transition-transform group-open:rotate-180"
              />
            </summary>

            <div className="border-t border-line px-5 pb-6 pt-5 sm:px-6">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <h3 className="text-lg font-bold">Comparație</h3>
                  <ul className="mt-4 space-y-4">
                    {[
                      { label: "Școala ta", value: school.enAverage, highlight: true },
                      {
                        label: `Județul ${school.county}`,
                        value: county?.enAverage ?? null,
                        highlight: false,
                      },
                      { label: "România", value: national.enAverage, highlight: false },
                    ].map((row) => (
                      <li key={row.label}>
                        <div className="flex items-baseline justify-between gap-4">
                          <span className={row.highlight ? "font-bold" : "text-sub"}>
                            {row.label}
                          </span>
                          <span className={`font-bold ${row.highlight ? "" : "text-sub"}`}>
                            {formatGrade(row.value)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-paper">
                          <div
                            className={`h-full rounded-full ${row.highlight ? "" : "bg-sub/40"}`}
                            style={{
                              width: `${((row.value ?? 0) / maxValue) * 100}%`,
                              ...(row.highlight
                                ? { background: meta?.color ?? "var(--color-brand)" }
                                : {}),
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-sub">
                    {differenceSentence(deltaNational, "națională")}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold">Pe discipline</h3>
                  <dl className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                    <CompactResult
                      label="Limba română"
                      value={formatGrade(school.romanianAverage)}
                    />
                    <CompactResult label="Matematică" value={formatGrade(school.mathAverage)} />
                    <CompactResult label="Absolvenți" value={formatCount(school.graduates)} />
                  </dl>
                </div>
              </div>

              <div className="mt-6 border-t border-line pt-5">
                <h3 className="text-lg font-bold">Evoluția rezultatelor</h3>
                {previousYear && deltaYear !== null ? (
                  <div className="mt-4 flex flex-wrap items-center gap-6">
                    <YearPoint year={previousYear.year} value={previousYear.enAverage} />
                    <Trendline
                      from={previousYear.enAverage}
                      to={school.enAverage}
                      color={meta?.color ?? "#0A0A0A"}
                    />
                    <YearPoint year={school.year} value={school.enAverage} emphasized />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-sub">
                    Nu există date comparabile pentru 2025 pentru această școală.
                  </p>
                )}
              </div>
            </div>
          </details>
        </Panel>
      </section>

      {/* 6 · HartaEdu — context separat de rezultatele EN */}
      <section id="hartaedu" className="mt-8 scroll-mt-6 border-t-4 border-line pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[28px] font-extrabold tracking-tight">
              Nevoi raportate pentru această școală în HartaEdu
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {alerts.length > 0 ? <HartaEduReportDialog school={school} /> : null}
          </div>
        </div>

        {alerts.length > 0 ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {alerts.map((alert) => (
              <HartaEduCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-5 rounded-md bg-paper px-6 py-6">
            <div>
              <p className="text-base text-sub">{HARTAEDU_EMPTY_MESSAGE}</p>
              <p className="mt-1 text-sm text-sub/80">{HARTAEDU_EMPTY_NOTE}</p>
            </div>
            <HartaEduReportDialog school={school} />
          </div>
        )}
      </section>

      {/* 7 · Pasul următor */}
      <section className="mt-8">
        {ngo && schoolEmailDraft ? (
          <Panel className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-[28px] font-extrabold tracking-tight">
                Contactează școala
              </h2>
              <p className="mt-1 max-w-[56ch] text-base text-sub">
                Trimite din partea {ngo.name} un email precompletat cu nevoile și propunerea de
                colaborare.
              </p>
              <p className="mt-2 text-sm text-sub/80">
                Flux demonstrativ: adresa școlii este fictivă și nu reprezintă date reale de
                contact.
              </p>
            </div>
            <a
              href={schoolEmailDraft.mailtoUrl}
              className="inline-flex min-h-14 items-center gap-2 rounded-md bg-brand px-7 py-4 text-lg font-semibold text-card"
            >
              <Send size={20} aria-hidden /> Contactează prin email
            </a>
          </Panel>
        ) : (
          <Panel className="flex flex-wrap items-center justify-between gap-6 border-brand! bg-brand! text-card">
            <div>
              <h2 className="font-display text-[28px] font-extrabold tracking-tight">
                Găsește sprijin pentru școala ta
              </h2>
              <p className="mt-1 max-w-[52ch] text-base text-card/90">
                Descoperă organizații care pot oferi sprijin educațional școlii tale.
              </p>
            </div>
            <Link
              to="/school/$schoolId/support"
              params={{ schoolId: school.id }}
              className="inline-flex min-h-14 items-center rounded-md bg-card px-7 py-4 text-lg font-bold text-brand"
            >
              Găsește ONG-uri
            </Link>
          </Panel>
        )}
      </section>
    </main>
  );
}

function CompactResult({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-paper px-4 py-3">
      <dt className="text-sm font-semibold text-sub">{label}</dt>
      <dd className="text-xl font-bold">{value}</dd>
    </div>
  );
}

function YearPoint({
  year,
  value,
  emphasized = false,
}: {
  year: number;
  value: number;
  emphasized?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-sub">{year}</p>
      <p
        className={`font-display font-extrabold leading-none ${
          emphasized ? "text-[44px]" : "text-[36px] text-sub"
        }`}
      >
        {formatGrade(value)}
      </p>
    </div>
  );
}

/** Grafic minimal cu două puncte — fără axe, fără ani inventați. */
function Trendline({ from, to, color }: { from: number; to: number; color: string }) {
  const min = Math.min(from, to);
  const max = Math.max(from, to);
  const span = Math.max(max - min, 0.2);
  const y = (v: number) => 46 - ((v - min) / span) * 32 - 7;
  return (
    <svg viewBox="0 0 160 56" className="h-14 w-40" role="img" aria-hidden>
      <line
        x1={10}
        y1={y(from)}
        x2={150}
        y2={y(to)}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={10} cy={y(from)} r={5} fill={color} opacity={0.5} />
      <circle cx={150} cy={y(to)} r={6} fill={color} />
    </svg>
  );
}

function HartaEduCard({ alert }: { alert: HartaEduAlert }) {
  const urgencyTone = getHartaEduUrgencyTone(alert.urgency);

  return (
    <article
      id={alert.id}
      className={`scroll-mt-6 rounded-md border-2 bg-card p-6 ${urgencyTone.borderClass}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-md px-3 py-1 text-sm font-semibold ${urgencyTone.bgClass} ${urgencyTone.textClass}`}
        >
          {alert.urgency}
        </span>
        <span className="text-sm font-medium text-sub">{alert.category}</span>
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold leading-tight">
        {alert.category} · {alert.locality}
      </p>
      <p className="mt-1 text-base text-sub">
        {formatCount(alert.impactedStudents)} elevi impactați
      </p>
      <p className="mt-4 text-sm font-semibold text-sub">Nevoi raportate</p>
      <ul className="mt-2 space-y-1">
        {alert.needs.map((need) => (
          <li key={need} className="text-base first-letter:uppercase">
            • {need}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-sub">Sursa: {alert.source}</span>
        <a
          href={alert.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand underline underline-offset-4"
        >
          Vezi alerta originală ↗
        </a>
      </div>
    </article>
  );
}
