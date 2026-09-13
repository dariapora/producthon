import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Breadcrumb, NAV_LABELS } from "@/components/layout/Breadcrumb";
import { NgoContactDialog } from "@/components/NgoContactDialog";
import { EmptyState, Panel, PanelTitle } from "@/components/ui/Panel";
import { getMockNgoEmail, getNgoContact } from "@/data/enrichment/ngoContactEnrichment";
import { getNgoById, getSchoolComparison } from "@/lib/dataset";
import { formatKm, haversineKm } from "@/lib/distance";
import { getHartaEduAlerts } from "@/lib/hartaedu";
import { buildGenericEmailDraft, buildSchoolEmailDraft } from "@/lib/ngoEmail";
import { getSchoolRecommendations } from "@/lib/ngoRecommendations";

type NgoSearch = { schoolId?: string };

export const Route = createFileRoute("/ngo/$ngoId")({
  validateSearch: (search: Record<string, unknown>): NgoSearch => {
    const value = search["schoolId"];
    return typeof value === "string" && value.length > 0 ? { schoolId: value } : {};
  },
  loaderDeps: ({ search }) => ({ schoolId: search.schoolId }),
  loader: ({ params, deps }) => {
    const ngo = getNgoById(params.ngoId);
    if (!ngo) throw notFound();

    const comparison = deps.schoolId ? getSchoolComparison(deps.schoolId) : null;
    const contact = getNgoContact(ngo.id);
    const email = contact?.email ?? getMockNgoEmail(ngo.id);
    const emailDraft = comparison
      ? buildSchoolEmailDraft({
          email,
          school: comparison.school,
          county: comparison.county,
          national: comparison.national,
        })
      : buildGenericEmailDraft(email, ngo.name);
    if (!comparison) return { ngo, context: null, contact, emailDraft };

    const school = comparison.school;
    const recommendation = getSchoolRecommendations(school).recommendations.find(
      (item) => item.ngo.id === ngo.id,
    );
    const distanceKm =
      school.latitude !== null &&
      school.longitude !== null &&
      ngo.latitude !== null &&
      ngo.longitude !== null
        ? haversineKm(
            { latitude: school.latitude, longitude: school.longitude },
            { latitude: ngo.latitude, longitude: ngo.longitude },
          )
        : null;

    return {
      ngo,
      context: {
        school,
        alerts: getHartaEduAlerts(school.county, school.schoolName),
        distanceKm,
        matchedNeeds: recommendation?.matchedNeeds ?? [],
        label: recommendation?.label ?? null,
      },
      contact,
      emailDraft,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "ONG indisponibil | EDUconnect" }, { name: "robots", content: "noindex" }],
      };
    }
    const { ngo } = loaderData;
    const title = `${ngo.name} | Organizație de sprijin | EDUconnect`;
    const description = `Organizație din ${ngo.locality}, județul ${ngo.county}. Tip intervenție: ${ngo.interventionType}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: NgoNotFound,
  component: NgoDetail,
});

function NgoDetail() {
  const { ngo, context, contact, emailDraft } = Route.useLoaderData();
  const school = context?.school ?? null;
  const interventions = ngo.interventionType
    .split(/[;+]/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <main className="mx-auto max-w-[1080px] px-6 py-8">
      <Breadcrumb
        items={[
          { label: NAV_LABELS.home, to: "/" },
          ...(school
            ? ([
                {
                  label: NAV_LABELS.findSchool,
                  to: "/find-school" as const,
                },
                {
                  label: school.schoolName,
                  to: "/school/$schoolId" as const,
                  params: { schoolId: school.id },
                },
                {
                  label: NAV_LABELS.recommendations,
                  to: "/school/$schoolId/support" as const,
                  params: { schoolId: school.id },
                },
              ] as const)
            : ([{ label: NAV_LABELS.ngoSupport, to: "/support" as const }] as const)),
          { label: ngo.name },
        ]}
      />

      <header className="rise mt-3">
        <h1 className="max-w-[26ch] text-balance font-display text-[44px] font-extrabold leading-[1.05] tracking-tight">
          {ngo.name}
        </h1>
        <p className="mt-2 text-lg text-sub">
          {ngo.locality}, {ngo.county}
          {context?.distanceKm != null ? ` · ${formatKm(context.distanceKm)} de școală` : ""}
        </p>
      </header>

      {context && school && (
        <section className="mt-6">
          <Panel>
            <PanelTitle meta={context.label ?? "Potrivire"}>Potrivire pentru școala ta</PanelTitle>
            <p className="mt-3 text-lg font-semibold">{school.schoolName}</p>
            <p className="mt-3 rounded-md bg-paper px-5 py-4 text-base text-sub">
              {ngo.relevanceReason ||
                "Organizația declară un domeniu de intervenție relevant pentru educație."}
            </p>
            {context.matchedNeeds.length > 0 && (
              <p className="mt-3 text-sm text-sub">
                Potrivire cu nevoile raportate: {context.matchedNeeds.join(", ")}.
              </p>
            )}
          </Panel>
        </section>
      )}

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Domenii de sprijin</PanelTitle>
          <ul className="mt-4 flex flex-wrap gap-2">
            {(interventions.length > 0 ? interventions : ngo.relevantCategories).map((item) => (
              <li
                key={item}
                className="rounded-md border border-line bg-paper px-4 py-2 text-base font-semibold"
              >
                {item}
              </li>
            ))}
          </ul>
          {!context && ngo.relevanceReason && (
            <p className="mt-5 text-base leading-relaxed text-sub">{ngo.relevanceReason}</p>
          )}
        </Panel>

        <Panel>
          <PanelTitle meta="Registrul ONG">Date organizație</PanelTitle>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Număr registru" value={ngo.registrationNumber || "Indisponibil"} />
            <Field label="Status" value={ngo.status} />
            <Field label="Categorie" value={ngo.legalCategory} />
            <Field label="Utilitate publică" value={ngo.publicUtility ? "Da" : "Nu"} />
          </dl>
        </Panel>
      </section>

      <section className="mt-5">
        <NgoContactDialog contact={contact} emailDraft={emailDraft} variant="panel" />
      </section>

      <nav className="mt-6 flex flex-wrap gap-5">
        {school ? (
          <>
            <Link
              to="/school/$schoolId/support"
              params={{ schoolId: school.id }}
              className="font-semibold text-brand underline underline-offset-4"
            >
              ← Înapoi la ONG-uri
            </Link>
            <Link
              to="/school/$schoolId"
              params={{ schoolId: school.id }}
              className="font-semibold text-brand underline underline-offset-4"
            >
              Vezi școala
            </Link>
          </>
        ) : (
          <Link to="/" className="font-semibold text-brand underline underline-offset-4">
            ← Înapoi la pagina principală
          </Link>
        )}
      </nav>
    </main>
  );
}

function NgoNotFound() {
  return (
    <main className="mx-auto max-w-[1080px] px-6 py-16">
      <EmptyState title="Organizația nu a fost găsită." />
      <Link
        to="/"
        className="mt-5 inline-block font-semibold text-brand underline underline-offset-4"
      >
        Înapoi la pagina principală
      </Link>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-paper px-4 py-3">
      <dt className="text-sm font-semibold text-sub">{label}</dt>
      <dd className="mt-1 text-pretty font-semibold">{value}</dd>
    </div>
  );
}
