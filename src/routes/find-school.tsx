import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { searchSchools } from "@/lib/dataset";

export const Route = createFileRoute("/find-school")({
  head: () => ({
    meta: [
      { title: "Caut ajutor pentru școala mea | EDUconnect" },
      {
        name: "description",
        content: "Găsește școala pentru a vedea rezultatele, nevoile și organizațiile potrivite.",
      },
    ],
  }),
  component: FindSchoolPage,
});

function FindSchoolPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchSchools(query, 8), [query]);
  const showResults = query.trim().length >= 2;

  return (
    <main className="mx-auto max-w-[860px] px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumb
        items={[{ label: "Acasă", to: "/" }, { label: "Caut ajutor pentru școala mea" }]}
      />

      <header className="mt-5">
        <h1 className="whitespace-nowrap text-[clamp(17px,4.2vw,34px)] font-bold leading-tight">
          Caut ajutor pentru școala mea
        </h1>
        <p className="mt-3 max-w-[58ch] text-lg leading-relaxed text-sub">
          Vezi rezultatele, nevoile și organizațiile potrivite.
        </p>
      </header>

      <section className="mt-8 rounded-md border-2 border-brand bg-card p-5 sm:p-7">
        <label htmlFor="school-search" className="text-base font-semibold">
          Scrie numele școlii sau al localității
        </label>
        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand"
            size={26}
            aria-hidden
          />
          <input
            id="school-search"
            type="search"
            autoComplete="off"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Exemplu: Școala 1, Iași"
            className="min-h-16 w-full rounded-md border-2 border-line bg-white py-3 pl-14 pr-4 text-lg outline-none placeholder:text-sub focus:border-brand"
          />
        </div>

        {showResults ? (
          <div className="mt-3 overflow-hidden rounded-md border-2 border-line bg-card">
            {results.length === 0 ? (
              <p className="px-5 py-6 text-sub">
                Nu am găsit școala. Încearcă numele localității sau al județului.
              </p>
            ) : (
              <ul aria-label="Rezultate căutare școli">
                {results.map((school) => (
                  <li key={school.id} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      onClick={() =>
                        void navigate({
                          to: "/school/$schoolId",
                          params: { schoolId: school.id },
                        })
                      }
                      className="flex min-h-18 w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper"
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold leading-snug">
                          {school.schoolName}
                        </span>
                        <span className="mt-0.5 block text-sm text-sub">
                          {school.locality ? `${school.locality}, ` : ""}județul {school.county}
                        </span>
                      </span>
                      <ArrowRight className="ml-auto shrink-0 text-brand" size={22} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-sub">Introdu cel puțin două caractere pentru căutare.</p>
        )}
      </section>
    </main>
  );
}
