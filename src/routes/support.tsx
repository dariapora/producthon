import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, MapPin, Search, Send } from "lucide-react";
import { useMemo, useState } from "react";

import { PerformanceBadge } from "@/components/RiskBadge";
import { SupportSchoolMap } from "@/components/SupportSchoolMap";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { EmptyState } from "@/components/ui/Panel";
import { normalizeKey } from "@/data/enrichment/localityCoordinates";
import { CURRENT_YEAR, getNgoById } from "@/lib/dataset";
import { getHartaEduUrgencyTone } from "@/lib/hartaedu";
import type { Ngo } from "@/lib/model";
import { formatCount, formatGrade } from "@/lib/risk";
import { buildNgoToSchoolEmailDraft } from "@/lib/schoolEmail";
import {
  getRankedSchoolsForNgo,
  searchLocatableNgos,
  type PrioritySchool,
  type SupportScope,
} from "@/lib/schoolSupport";

type SupportSearch = { ngoId?: string; scope?: SupportScope };

export const Route = createFileRoute("/support")({
  validateSearch: (search: Record<string, unknown>): SupportSearch => ({
    ...(typeof search.ngoId === "string" && search.ngoId.length > 0 ? { ngoId: search.ngoId } : {}),
    ...(search.scope === "county" || search.scope === "national" ? { scope: search.scope } : {}),
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
  const scope = search.scope ?? "county";
  const selectedNgo = search.ngoId ? getNgoById(search.ngoId) : null;
  const ngo = selectedNgo?.county !== "Nedeterminat" ? selectedNgo : null;
  const [schoolQuery, setSchoolQuery] = useState("");
  const [view, setView] = useState<"list" | "map">("map");
  const [visibleCount, setVisibleCount] = useState(24);

  const scopedSchools = useMemo(
    () => (ngo ? getRankedSchoolsForNgo(ngo, scope) : []),
    [ngo, scope],
  );
  const filteredSchools = useMemo(() => {
    const term = normalizeKey(schoolQuery);
    if (!term) return scopedSchools;
    return scopedSchools.filter(({ school }) =>
      normalizeKey(`${school.schoolName} ${school.locality ?? ""}`).includes(term),
    );
  }, [schoolQuery, scopedSchools]);
  const reportedSchools = scopedSchools.filter(({ alerts }) => alerts.length > 0);
  const impactedStudents = reportedSchools.reduce(
    (total, { alerts }) =>
      total + alerts.reduce((subtotal, alert) => subtotal + alert.impactedStudents, 0),
    0,
  );

  function updateSelection(nextNgoId?: string, nextScope?: SupportScope) {
    setSchoolQuery("");
    setVisibleCount(24);
    void navigate({
      to: "/support",
      search: nextNgoId ? { ngoId: nextNgoId, scope: nextScope ?? "county" } : {},
    });
  }

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-7 sm:px-6 sm:py-10">
      <header>
        <Breadcrumb items={[{ label: "Acasă", to: "/" }, { label: "Reprezint un ONG" }]} />
        <div className="mt-6 max-w-[780px]">
          <h1 className="text-balance text-[36px] font-bold leading-[1.08] sm:text-[46px]">
            Găsește școli pe care organizația ta le poate sprijini
          </h1>
          <p className="mt-3 max-w-[64ch] text-lg leading-relaxed text-sub">
            Selectează ONG-ul, explorează situația școlilor din zona sa și contactează direct
            școala.
          </p>
        </div>
      </header>

      <section className="mt-8 rounded-md border-2 border-brand bg-card p-5 sm:p-7">
        <h2 className="text-[22px] font-bold">1. Selectează organizația</h2>
        {ngo ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-5 rounded-md bg-paper px-5 py-4">
            <div>
              <p className="font-bold">{ngo.name}</p>
              <p className="mt-1 text-sm text-sub">
                {ngo.locality}, județul {ngo.county} · {ngo.interventionType}
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateSelection()}
              className="min-h-11 font-semibold text-brand underline decoration-2 underline-offset-4"
            >
              Schimbă ONG-ul
            </button>
          </div>
        ) : (
          <NgoSelector onSelect={(selected) => updateSelection(selected.id, "county")} />
        )}
      </section>

      {ngo ? (
        <>
          <section
            aria-label="Rezumat pentru aria selectată"
            className="mt-7 grid border-y-2 border-line sm:grid-cols-3"
          >
            <SummaryStat value={formatCount(reportedSchools.length)} label="școli cu raportări" />
            <SummaryStat value={formatCount(impactedStudents)} label="elevi impactați" />
            <SummaryStat
              value={formatCount(scopedSchools.length)}
              label={scope === "county" ? `școli în ${ngo.county}` : "școli în România"}
            />
          </section>

          {reportedSchools.length > 0 ? (
            <HartaEduHighlights schools={reportedSchools} ngo={ngo} scope={scope} />
          ) : null}

          <section id="scoli" className="mt-10 scroll-mt-24 border-t-4 border-ink pt-6">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 className="text-[28px] font-bold">
                  2.{" "}
                  {scope === "county"
                    ? `Situația școlilor din ${ngo.county}`
                    : "Situația școlilor din România"}
                </h2>
                <p className="mt-2 max-w-[68ch] text-base text-sub">
                  Școlile sunt mapate pe localități și colorate după rezultatele la Evaluarea
                  Națională. Raportările HartaEdu sunt marcate separat.
                </p>
              </div>
              <div
                className="flex gap-5 border-b border-line"
                role="group"
                aria-label="Mod de afișare"
              >
                <ViewButton active={view === "list"} onClick={() => setView("list")}>
                  Listă
                </ViewButton>
                <ViewButton active={view === "map"} onClick={() => setView("map")}>
                  Hartă
                </ViewButton>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-4">
              <label className="min-w-[260px] flex-1">
                <span className="mb-1.5 block text-sm font-semibold">Școală sau localitate</span>
                <input
                  type="search"
                  value={schoolQuery}
                  onChange={(event) => {
                    setSchoolQuery(event.target.value);
                    setVisibleCount(24);
                  }}
                  placeholder="Scrie un nume"
                  className="min-h-12 w-full rounded-md border border-line bg-card px-4 py-3 outline-none focus:border-brand"
                />
              </label>
              <button
                type="button"
                onClick={() => updateSelection(ngo.id, scope === "county" ? "national" : "county")}
                className="min-h-12 border-2 border-brand px-5 py-2 font-semibold text-brand hover:bg-card"
              >
                {scope === "county"
                  ? "Extinde căutarea în toată țara"
                  : `Revino la județul ${ngo.county}`}
              </button>
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
                <SupportSchoolMap schools={filteredSchools} ngo={ngo} scope={scope} />
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
                className="mt-6 min-h-12 border-2 border-brand px-5 py-2 font-semibold text-brand hover:bg-card"
              >
                Arată următoarele 24
              </button>
            ) : null}
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
  return (
    <section className="mt-10 border-t-4 border-risk-yel pt-6" aria-labelledby="hartaedu-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="hartaedu-title" className="text-[26px] font-bold">
            Nevoi raportate prin HartaEdu
          </h2>
          <p className="mt-2 max-w-[68ch] text-base text-sub">
            Cazuri concrete de la care poți începe.
          </p>
        </div>
        <span className="text-sm font-semibold text-sub">
          {scope === "county" ? `Județul ${ngo.county}` : "Toată țara"}
        </span>
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
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchLocatableNgos(query), [query]);
  const showResults = open && query.trim().length >= 2;

  return (
    <div className="relative mt-4">
      <label htmlFor="ngo-search" className="text-base font-semibold">
        Numele ONG-ului
      </label>
      <div className="relative mt-2">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand"
          size={24}
          aria-hidden
        />
        <input
          id="ngo-search"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder="Exemplu: asociație, fundație, localitate"
          className="min-h-16 w-full rounded-md border-2 border-line bg-white py-3 pl-14 pr-4 text-lg outline-none placeholder:text-sub focus:border-brand"
        />
      </div>
      {showResults ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border-2 border-brand bg-card shadow-lg">
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
          Introdu cel puțin două caractere. ONG-urile fără județ cunoscut nu sunt afișate.
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
                    {alerts.length} {alerts.length === 1 ? "nevoie raportată" : "nevoi raportate"}{" "}
                    pe HartaEdu
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
        active ? "border-brand text-brand" : "border-transparent text-sub hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
