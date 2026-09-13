import { createFileRoute, notFound } from "@tanstack/react-router";

import { CountySituationPanel } from "@/components/CountySituationPanel";
import { Breadcrumb, NAV_LABELS } from "@/components/layout/Breadcrumb";
import { CountyPerformanceLegend } from "@/components/RiskBadge";
import { CURRENT_YEAR, getCountyBySlug } from "@/lib/dataset";

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

      <CountySituationPanel county={county} variant="page" />
    </main>
  );
}
