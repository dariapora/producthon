import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, MapPin, Search, Send } from "lucide-react";
import { useMemo, useState } from "react";

import { CountySituationPanel } from "@/components/CountySituationPanel";
import { PerformanceBadge } from "@/components/RiskBadge";
import { RomaniaCountyMap } from "@/components/RomaniaCountyMap";
import { SupportSchoolMap } from "@/components/SupportSchoolMap";
import { Breadcrumb, NAV_LABELS } from "@/components/layout/Breadcrumb";
import { EmptyState } from "@/components/ui/Panel";
import { normalizeKey } from "@/data/enrichment/localityCoordinates";
import { CURRENT_YEAR, getAllCountyStats, getNationalStats, getNgoById } from "@/lib/dataset";
import { getHartaEduUrgencyTone } from "@/lib/hartaedu";
import type { Ngo } from "@/lib/model";
import { formatCount, formatGrade } from "@/lib/risk";
import { buildNgoToSchoolEmailDraft } from "@/lib/schoolEmail";
import {
  getRankedSchoolsForNgo,
  locatableNgoCounties,
  searchLocatableNgos,
  type PrioritySchool,
  type SupportScope,
} from "@/lib/schoolSupport";

type SupportSearch = { ngoId?: string };

export const Route = createFileRoute("/support")({
  validateSearch: (search: Record<string, unknown>): SupportSearch => ({
    ...(typeof search.ngoId === "string" && search.ngoId.length > 0 ? { ngoId: search.ngoId } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Găsește școli pentru ONG-ul tău | EDUconnect" },
      {
        name: "description",
        content: "Selectează organizația și explorează situația școlilor din județul ei.",
      },
    ],
  }),
  component: SupportOverview,
});

function SupportOverview() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const scope = "county";
  const selectedNgo = search.ngoId ? getNgoById(search.ngoId) : null;
  const ngo = selectedNgo?.county !== "Nedeterminat" ? selectedNgo : null;
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolSearchOpen, setSchoolSearchOpen] = useState(false);
  const [view, setView] = useState<"list" | "map" | "national">("map");
  const [visibleCount, setVisibleCount] = useState(24);
  const [nationalSelectedCounty, setNationalSelectedCounty] = useState<string | null>(null);
  const national = getNationalStats(CURRENT_YEAR);
  const allCounties = useMemo(() => getAllCountyStats(CURRENT_YEAR), []);

  const scopedSchools = useMemo(
    () => (ngo ? getRankedSchoolsForNgo(ngo, scope) : []),
    [ngo, scope],
  );
  const areaSchools = scopedSchools;
  const filteredSchools = useMemo(() => {
    const term = normalizeKey(schoolQuery);
    if (!term) return areaSchools;
    return areaSchools.filter(({ school }) =>
      normalizeKey(`${school.schoolName} ${school.locality ?? ""}`).includes(term),
    );
  }, [areaSchools, schoolQuery]);
  const suggestedSchools = filteredSchools.slice(0, 8);
  const reportedSchools = areaSchools.filter(({ alerts }) => alerts.length > 0);
  const impactedStudents = reportedSchools.reduce(
    (total, { alerts }) =>
      total + alerts.reduce((subtotal, alert) => subtotal + alert.impactedStudents, 0),
    0,
  );

  function updateSelection(nextNgoId?: string) {
    setSchoolQuery("");
    setView("map");
    setVisibleCount(24);
    void navigate({
      to: "/support",
      search: nextNgoId ? { ngoId: nextNgoId } : {},
    });
  }

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-7 sm:px-6 sm:py-10">
      <header>
        <Breadcrumb
          items={[{ label: NAV_LABELS.home, to: "/" }, { label: NAV_LABELS.ngoSupport }]}
        />
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="max-w-[720px]">
            <h1 className="text-balance text-[36px] font-bold leading-[1.08] sm:text-[46px]">
              Găsește școli care au nevoie de ajutor
            </h1>
          </div>

          {ngo ? (
            <section className="rounded-md border border-line bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-paper text-brand">
                    <Building2 size={18} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-sub">
                      Organizația selectată
                    </p>
                    <p className="truncate font-bold">{ngo.name}</p>
                    <p className="truncate text-xs text-sub">
                      {ngo.locality}, {ngo.county} · {ngo.interventionType}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSelection()}
                  className="min-h-10 shrink-0 text-sm font-semibold text-brand underline decoration-2 underline-offset-4"
                >
                  Schimbă
                </button>
              </div>
            </section>
          ) : (
            <section className="rounded-md border-2 border-sub bg-card p-5">
              <h2 className="text-xl font-bold">Selectează organizația</h2>
              <NgoSelector onSelect={(selected) => updateSelection(selected.id)} />
            </section>
          )}
        </div>
      </header>

      {ngo ? (
        <>
          <section id="scoli" className="mt-10 scroll-mt-24 border-sub pt-2">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 className="text-[28px] font-bold">
                  {view === "national"
                    ? `Situația națională ${CURRENT_YEAR}`
                    : `Situația școlilor din ${ngo.county}`}
                </h2>
              </div>
              <div
                className="flex gap-5 border-b border-line"
                role="group"
                aria-label="Mod de afișare"
              >
                <ViewButton active={view === "map"} onClick={() => setView("map")}>
                  Hartă
                </ViewButton>
                <ViewButton active={view === "list"} onClick={() => setView("list")}>
                  Listă
                </ViewButton>
                <ViewButton active={view === "national"} onClick={() => setView("national")}>
                  Situația națională
                </ViewButton>
              </div>
            </div>

            {view === "national" ? (
              <div className="mt-6">
                <p className="text-sm text-sub">
                  Selectează un județ pentru a-i vedea situația, fără să părăsești pagina.
                </p>
                <RomaniaCountyMap
                  counties={allCounties}
                  nationalAverage={national.enAverage}
                  onSelectCounty={setNationalSelectedCounty}
                />
                {nationalSelectedCounty ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setNationalSelectedCounty(null)}
                      className="mt-8 min-h-11 border-2 border-sub px-4 py-2 text-sm font-semibold text-brand hover:bg-card"
                    >
                      Vezi toate județele
                    </button>
                    <CountySituationPanel county={nationalSelectedCounty} variant="embedded" />
                  </>
                ) : null}
              </div>
            ) : (
              <>
                <div className="mt-6 grid items-end gap-4 ">
                  <label className="min-w-[260px] flex-1">
                    <span className="mb-1.5 block text-sm font-semibold">
                      Școală sau localitate
                    </span>
                    <div className="relative">
                      <input
                        type="search"
                        value={schoolQuery}
                        onFocus={() => setSchoolSearchOpen(true)}
                        onBlur={() => window.setTimeout(() => setSchoolSearchOpen(false), 150)}
                        onChange={(event) => {
                          setSchoolQuery(event.target.value);
                          setVisibleCount(24);
                          setSchoolSearchOpen(true);
                        }}
                        placeholder="Scrie un nume"
                        className="min-h-12 w-full rounded-md border border-line bg-card px-4 py-3 outline-none focus:border-sub"
                      />
                      {schoolSearchOpen && suggestedSchools.length > 0 ? (
                        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border-2 border-sub bg-card shadow-lg">
                          <ul aria-label="Sugestii școli">
                            {suggestedSchools.map(({ school }) => (
                              <li key={school.id} className="border-b border-line last:border-b-0">
                                <button
                                  type="button"
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={() => {
                                    setSchoolQuery(school.schoolName);
                                    setSchoolSearchOpen(false);
                                    setVisibleCount(24);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-paper"
                                >
                                  <span className="block font-semibold">
                                    {school.schoolName}
                                  </span>
                                  <span className="block text-sm text-sub">
                                    {school.locality ?? school.county}, {school.county}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </label>
                </div>

                <p className="mt-5 border-b-2 border-line pb-4 text-sm font-semibold text-sub">
                  {formatCount(filteredSchools.length)}{" "}
                  {filteredSchools.length === 1 ? "rezultat" : "rezultate"}
                </p>

                {filteredSchools.length === 0 ? (
                  <div className="mt-6">
                    <EmptyState title="Nu am găsit școli pentru această căutare." />
                  </div>
                ) : view === "map" ? (
                  <div className="mt-6">
                    <SupportSchoolMap
                      key={`${ngo.id}-${scope}`}
                      schools={filteredSchools}
                      ngo={ngo}
                      scope={scope}
                    />
                    {reportedSchools.length > 0 ? (
                      <HartaEduHighlights schools={reportedSchools} ngo={ngo} scope={scope} />
                    ) : null}
                  </div>
                ) : (
                  <SchoolList
                    schools={filteredSchools.slice(0, visibleCount)}
                    ngo={ngo}
                    scope={scope}
                  />
                )}

                {view === "list" && visibleCount < filteredSchools.length ? (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + 24)}
                    className="mt-6 min-h-12 border-2 border-sub px-5 py-2 font-semibold text-brand hover:bg-card"
                  >
                    Arată următoarele 24
                  </button>
                ) : null}
              </>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}

function HartaEduHighlights({
  schools,
  ngo,
  scope,
}: {
  schools: PrioritySchool[];
  ngo: Ngo;
  scope: SupportScope;
}) {
  const reportedNeeds = schools.reduce((total, { alerts }) => total + alerts.length, 0);

  return (
    <section className="mt-10" aria-labelledby="hartaedu-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {reportedNeeds > 0 ? (
            <h2 id="hartaedu-title" className="text-[26px] font-bold">
              {formatCount(reportedNeeds)} nevoi raportate prin HartaEdu
            </h2>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {schools.map(({ school, alerts }) => {
          const emailDraft = buildNgoToSchoolEmailDraft({ ngo, school, alerts });
          const needs = [...new Set(alerts.flatMap((alert) => alert.needs))];
          const urgencyTone = getHartaEduUrgencyTone(alerts[0]?.urgency ?? "");
          return (
            <article
              key={school.id}
              className={`rounded-md border-2 bg-card p-5 ${urgencyTone.borderClass}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold leading-snug">{school.schoolName}</h3>
                  <p className="mt-1 text-sm text-sub">
                    {school.locality ?? school.county}, {school.county}
                  </p>
                </div>
                <span
                  className={`rounded-md px-2 py-1 text-sm font-semibold ${urgencyTone.bgClass} ${urgencyTone.textClass}`}
                >
                  {alerts[0]?.urgency}
                </span>
              </div>
              <p className="mt-3 text-sm">
                <span className="font-semibold">Nevoi:</span> {needs.join(", ")}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                <Link
                  to="/school/$schoolId"
                  params={{ schoolId: school.id }}
                  search={{ ngoId: ngo.id, scope }}
                  className="inline-flex min-h-10 items-center text-brand underline underline-offset-4"
                >
                  Vezi școala
                </Link>
                <a
                  href={emailDraft.mailtoUrl}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md bg-brand px-4 text-card"
                >
                  <Send size={17} aria-hidden /> Contactează
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
function NgoSelector({ onSelect }: { onSelect: (ngo: Ngo) => void }) {
  const [county, setCounty] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchLocatableNgos(query, county), [county, query]);
  const showResults = open && county.length > 0 && query.trim().length >= 2;

  return (
    <div className="relative mt-4">
      <label htmlFor="ngo-county" className="text-sm font-semibold">
        1. Județul
      </label>
      <select
        id="ngo-county"
        value={county}
        onChange={(event) => {
          setCounty(event.target.value);
          setQuery("");
          setOpen(false);
        }}
        className="mt-1.5 min-h-12 w-full rounded-md border-2 border-line bg-white px-3 py-2 outline-none focus:border-sub"
      >
        <option value="">Alege județul</option>
        {locatableNgoCounties.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <label htmlFor="ngo-search" className="mt-3 block text-sm font-semibold">
        2. Numele ONG-ului
      </label>
      <div className="relative mt-1.5">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand"
          size={20}
          aria-hidden
        />
        <input
          id="ngo-search"
          type="search"
          autoComplete="off"
          disabled={!county}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder={county ? "Asociație sau fundație" : "Alege mai întâi județul"}
          className="min-h-12 w-full rounded-md border-2 border-line bg-white py-2 pl-11 pr-3 outline-none placeholder:text-sub focus:border-sub disabled:cursor-not-allowed disabled:bg-paper"
        />
      </div>
      {showResults ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border-2 border-sub bg-card shadow-lg">
          {results.length === 0 ? (
            <p className="px-5 py-5 text-sub">
              Nu am găsit un ONG cu județ cunoscut pentru „{query}”.
            </p>
          ) : (
            <ul aria-label="Rezultate căutare ONG-uri">
              {results.map((ngo) => (
                <li key={ngo.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onSelect(ngo)}
                    className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-md bg-paper text-brand">
                      <Building2 size={22} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold leading-snug">{ngo.name}</span>
                      <span className="mt-0.5 block text-sm text-sub">
                        {ngo.locality}, județul {ngo.county}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="mt-2 text-sm text-sub">
          {county
            ? "Introdu cel puțin două caractere."
            : "Selectează județul pentru a activa căutarea."}
        </p>
      )}
    </div>
  );
}
function SchoolList({
  schools,
  ngo,
  scope,
}: {
  schools: PrioritySchool[];
  ngo: Ngo;
  scope: SupportScope;
}) {
  return (
    <ol className="border-b-2 border-line">
      {schools.map(({ school, alerts }, index) => {
        const emailDraft = buildNgoToSchoolEmailDraft({ ngo, school, alerts });
        return (
          <li key={school.id} className="border-b border-line py-5 last:border-b-0 sm:px-3">
            <article className="grid gap-4 md:grid-cols-[2.5rem_minmax(0,1fr)_auto] md:items-center">
              <span className="hidden font-mono text-sm text-sub md:block">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="font-bold leading-snug">{school.schoolName}</h3>
                <p className="mt-1 text-sm text-sub">
                  {school.locality ?? school.county}, {school.county} ·{" "}
                  {formatCount(school.graduates)} absolvenți
                </p>
                {alerts.length > 0 ? (
                  <p className="mt-2 text-sm font-semibold text-brand">
                    {formatCount(alerts.length)} nevoi raportate prin HartaEdu
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-sub">Fără nevoi raportate în HartaEdu</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <strong className="text-xl">{formatGrade(school.enAverage)}</strong>
                <PerformanceBadge average={school.enAverage} scale="school" size="sm" />
                <Link
                  to="/school/$schoolId"
                  params={{ schoolId: school.id }}
                  search={{ ngoId: ngo.id, scope }}
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand underline underline-offset-4"
                >
                  <MapPin size={18} aria-hidden /> Vezi școala
                </Link>
                <a
                  href={emailDraft.mailtoUrl}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand px-4 py-2 font-semibold text-card"
                >
                  <Send size={18} aria-hidden /> Contactează
                </a>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

function SummaryStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-line px-1 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-1 sm:last:border-r-0">
      <strong className="text-[28px] leading-none">{value}</strong>
      <span className="text-sm font-medium text-sub">{label}</span>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 border-b-3 px-1 text-sm font-semibold ${
        active ? "border-sub text-brand" : "border-transparent text-sub hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
