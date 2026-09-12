import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getSchoolById } from "@/lib/dataset";
import { formatKm } from "@/lib/distance";
import {
  INTERVENTION_TYPES,
  getSchoolRecommendations,
  locationFallback,
  sortRecommendations,
  type NgoRecommendation,
  type SortMode,
} from "@/lib/ngoRecommendations";

export const Route = createFileRoute("/school/$schoolId/support")({
  loader: ({ params }) => {
    const school = getSchoolById(params.schoolId);
    if (!school) throw notFound();
    const result = getSchoolRecommendations(school);
    return { school, result };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Sprijin indisponibil | EDUconnect" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `Sprijin pentru ${loaderData.school.schoolName} | EDUconnect`;
    const description = `Organizații care pot oferi sprijin educațional pentru ${loaderData.school.schoolName}, județul ${loaderData.school.county}.`;
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
  component: SchoolSupport,
});

function SchoolSupport() {
  const { school, result } = Route.useLoaderData();

  const [supportType, setSupportType] = useState<string>("Toate");
  const [sort, setSort] = useState<SortMode>("recomandate");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const list = result.recommendations.filter((item) => {
      if (supportType !== "Toate" && !item.ngo.relevantCategories.includes(supportType)) {
        return false;
      }
      return true;
    });
    return sortRecommendations(list, sort);
  }, [result.recommendations, supportType, sort]);

  const visible = showAll ? filtered : filtered.slice(0, 5);

  return (
    <main className="mx-auto max-w-[1080px] px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Acasă", to: "/" },
          { label: "Vreau să ajut", to: "/support" },
          { label: "Organizații potrivite" },
        ]}
      />
      <section className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-4 border-ink pb-5">
          <h1 className="text-[34px] font-bold leading-tight sm:text-[40px]">
            Organizații potrivite
          </h1>
          <p className="font-semibold text-sub">{filtered.length} organizații</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Tip sprijin">
            <select
              value={supportType}
              onChange={(event) => setSupportType(event.target.value)}
              className="min-h-14 w-full rounded-md border-2 border-line bg-card px-4 py-3 text-base font-semibold focus:border-brand"
            >
              <option value="Toate">Toate</option>
              {INTERVENTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sortare">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
              className="min-h-14 w-full rounded-md border-2 border-line bg-card px-4 py-3 text-base font-semibold focus:border-brand"
            >
              <option value="recomandate">Recomandate</option>
              <option value="apropiate">Mai aproape</option>
              <option value="alfabetic">Alfabetic</option>
            </select>
          </Field>
        </div>

        {result.expandedBeyondCounty && (
          <p className="mt-5 border-l-4 border-brand pl-4 text-sm text-sub">
            Am extins căutarea în afara județului pentru a găsi mai multe organizații relevante.
          </p>
        )}

        <div className="mt-6 border-y-2 border-line">
          {visible.map((item) => (
            <RecommendationRow key={item.ngo.id} item={item} schoolId={school.id} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="border-b-2 border-line py-10">
            <p className="font-bold">
              Nu am identificat momentan ONG-uri potrivite în zona selectată.
            </p>
            <button
              type="button"
              onClick={() => {
                setSupportType("Toate");
                setShowAll(true);
              }}
              className="mt-4 min-h-12 border-2 border-brand px-5 font-semibold text-brand"
            >
              Vezi toate ONG-urile relevante din România
            </button>
          </div>
        )}

        {filtered.length > 5 && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mt-5 min-h-12 border-2 border-brand bg-card px-5 py-3 text-base font-semibold text-brand"
          >
            Vezi încă {filtered.length - 5} organizații
          </button>
        )}

        <div className="mt-8 border-t border-line pt-5">
          <Link
            to="/school/$schoolId"
            params={{ schoolId: school.id }}
            className="inline-flex min-h-12 items-center font-semibold text-brand underline underline-offset-4"
          >
            Înapoi la rezultatele școlii
          </Link>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-sub">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function RecommendationRow({ item, schoolId }: { item: NgoRecommendation; schoolId: string }) {
  const { ngo } = item;
  return (
    <article className="border-b border-line py-6 last:border-b-0 sm:px-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-xl font-bold tracking-tight">{ngo.name}</h3>
        <span className="text-sm font-semibold text-brand">{item.label}</span>
      </div>

      <p className="mt-2 text-sub">
        {item.distanceKm !== null ? (
          <>{formatKm(item.distanceKm)} distanță · </>
        ) : (
          <>{locationFallback(ngo)} · </>
        )}
        {ngo.locality}, {ngo.county}
      </p>

      <p className="mt-3 text-base">
        <span className="font-semibold">Tip intervenție:</span> {ngo.interventionType}
      </p>
      <p className="mt-2 text-base text-sub">
        <span className="font-semibold text-ink">De ce apare aici:</span> {ngo.relevanceReason}
      </p>
      {item.matchedNeeds.length > 0 && (
        <p className="mt-2 text-sm text-sub">
          Potrivit datelor disponibile, ONG-ul este relevant pentru nevoia:{" "}
          {item.matchedNeeds.join(", ")}.
        </p>
      )}

      <Link
        to="/ngo/$ngoId"
        params={{ ngoId: ngo.id }}
        search={{ schoolId }}
        className="mt-4 inline-flex min-h-12 items-center font-semibold text-brand underline underline-offset-4"
      >
        Vezi detalii →
      </Link>
    </article>
  );
}
