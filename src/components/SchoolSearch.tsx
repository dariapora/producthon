import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { getSchoolsInCounty, schoolCounties, searchSchoolsInCounty } from "@/lib/dataset";
import { hasHartaEduAlerts } from "@/lib/hartaedu";
import { formatGrade } from "@/lib/risk";

export function SchoolSearch({
  county,
  autoFocus = false,
}: {
  county?: string;
  autoFocus?: boolean;
}) {
  const navigate = useNavigate();
  const [selectedCounty, setSelectedCounty] = useState(county ?? "");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const activeCounty = county ?? selectedCounty;

  const results = useMemo(
    () =>
      !activeCounty
        ? []
        : query.trim().length >= 2
          ? searchSchoolsInCounty(activeCounty, query)
          : getSchoolsInCounty(activeCounty).slice(0, 8),
    [activeCounty, query],
  );
  const showResults = open && activeCounty.length > 0;

  return (
    <div className="relative">
      <div
        className={county ? "" : "grid gap-3 sm:grid-cols-[minmax(180px,0.7fr)_minmax(0,1.3fr)]"}
      >
        {!county ? (
          <label className="block">
            <span className="text-base font-semibold text-ink">1. Județul</span>
            <select
              value={selectedCounty}
              onChange={(event) => {
                setSelectedCounty(event.target.value);
                setQuery("");
                setOpen(false);
              }}
              className="mt-2 min-h-16 w-full rounded-md border-2 border-line bg-card px-4 py-3 text-lg outline-none focus:border-sub"
            >
              <option value="">Alege județul</option>
              {schoolCounties.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block">
          <span className="text-base font-semibold text-ink">
            {county ? `Caută în județul ${county}` : "2. Numele școlii"}
          </span>
          <span className="relative mt-2 block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand"
              size={25}
              aria-hidden
            />
            <input
              id="school-search"
              type="search"
              autoComplete="off"
              autoFocus={autoFocus && Boolean(activeCounty)}
              disabled={!activeCounty}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => window.setTimeout(() => setOpen(false), 150)}
              placeholder={
                activeCounty ? "Numele școlii sau localitatea" : "Alege mai întâi județul"
              }
              className="min-h-16 w-full rounded-md border-2 border-line bg-card py-3 pl-14 pr-4 text-lg outline-none placeholder:text-sub/70 focus:border-sub disabled:cursor-not-allowed disabled:bg-paper disabled:text-sub"
            />
          </span>
        </label>
      </div>

      {showResults && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border-2 border-sub bg-card">
          {results.length === 0 ? (
            <p className="px-5 py-4 text-sm text-sub">
              Nicio școală găsită în județul {activeCounty} pentru „{query}”.
            </p>
          ) : (
            <ul>
              {results.map((school) => {
                const flagged = hasHartaEduAlerts(school.county, school.schoolName);
                return (
                  <li key={school.id} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        navigate({ to: "/school/$schoolId", params: { schoolId: school.id } })
                      }
                      className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper"
                    >
                      <span className="grid size-12 shrink-0 place-items-center rounded-md bg-paper text-brand">
                        <Building2 size={23} aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{school.schoolName}</span>
                        <span className="block text-sm text-sub">
                          {school.locality ? `${school.locality} · ` : ""}
                          {school.county} · Media EN 2026: {formatGrade(school.enAverage)}
                        </span>
                        {flagged && (
                          <span className="mt-1 inline-flex rounded-md border border-risk-yel/35 bg-risk-yel-bg px-2 py-0.5 text-xs font-semibold text-risk-yel">
                            Nevoi raportate pe HartaEdu
                          </span>
                        )}
                      </span>
                      <ArrowRight className="ml-auto shrink-0 text-brand" size={24} aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
