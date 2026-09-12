import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { searchSchools, searchSchoolsInCounty } from "@/lib/dataset";
import { hasHartaEduAlerts } from "@/lib/hartaedu";
import { formatGrade } from "@/lib/risk";

export function SchoolSearch({ county }: { county?: string }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(
    () => (county ? searchSchoolsInCounty(county, query) : searchSchools(query)),
    [county, query],
  );
  const showResults = open && query.trim().length >= 2;

  return (
    <div className="relative">
      <label htmlFor="school-search" className="text-base font-semibold text-ink">
        {county ? `Caută în județul ${county}` : "Caută școala ta"}
      </label>
      <div className="relative mt-2">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand"
          size={25}
          aria-hidden
        />
        <input
          id="school-search"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder={
            county ? "Numele școlii sau localitatea" : "Numele școlii, localitatea sau județul"
          }
          className="min-h-16 w-full rounded-md border-2 border-line bg-card py-3 pl-14 pr-4 text-lg outline-none placeholder:text-sub/70 focus:border-brand"
        />
      </div>

      {showResults && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border-2 border-brand bg-card">
          {results.length === 0 ? (
            <p className="px-5 py-4 text-sm text-sub">
              Nicio școală găsită{county ? ` în județul ${county}` : ""} pentru „{query}”.
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
