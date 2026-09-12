import { createFileRoute } from "@tanstack/react-router";

import { SchoolSearch } from "@/components/SchoolSearch";
import { Breadcrumb, NAV_LABELS } from "@/components/layout/Breadcrumb";

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
  return (
    <main className="mx-auto max-w-[860px] px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumb items={[{ label: NAV_LABELS.home, to: "/" }, { label: NAV_LABELS.findSchool }]} />

      <header className="mt-5">
        <h1 className="whitespace-nowrap text-[clamp(17px,4.2vw,34px)] font-bold leading-tight">
          Caut ajutor pentru școala mea
        </h1>
        <p className="mt-3 max-w-[58ch] text-lg leading-relaxed text-sub">
          Vezi rezultatele, nevoile și organizațiile potrivite.
        </p>
      </header>

      <section className="mt-8 rounded-md border-2 border-sub bg-card p-5 sm:p-7">
        <SchoolSearch />
      </section>
    </main>
  );
}
