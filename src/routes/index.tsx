import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EDUconnect | Alege ce vrei să faci" },
      {
        name: "description",
        content:
          "Găsește ajutor pentru școala ta, oferă sprijin sau vezi situația educației din România.",
      },
    ],
  }),
  component: HomePage,
});

const JOURNEYS = [
  {
    key: "school",
    title: "Sunt director",
    description: "Vreau să găsesc ajutor pentru școala mea.",
    to: "/find-school" as const,
  },
  {
    key: "support",
    title: "Reprezint un ONG",
    description: "Aleg organizația și contactez școlile care au nevoie de ajutor.",
    to: "/support" as const,
  },
] as const;

function HomePage() {
  return (
    <main className="mx-auto max-w-[1040px] px-4 py-10 sm:px-6 sm:py-16">
      <header className="max-w-[680px]">
        <h1 className="text-balance text-[34px] font-bold leading-tight sm:text-[44px]">
          Cum vrei să ajuți educația?
        </h1>
      </header>

      <section
        className="mt-9 grid gap-5 min-[860px]:grid-cols-2"
        aria-label="Alege ce vrei să faci"
      >
        {JOURNEYS.map((item) => {
          return (
            <Link
              key={item.key}
              to={item.to}
              className="group flex min-h-[220px] flex-col rounded-md border-2 border-line bg-card p-5 transition-colors hover:border-brand sm:p-6"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[18px] font-bold leading-snug sm:whitespace-nowrap sm:text-[20px] lg:text-[22px]">
                  {item.title}
                </span>
                <span className="mt-3 block max-w-[42ch] text-base leading-relaxed text-sub">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </section>

      <p className="mt-7 text-base text-sub">
        Vrei doar să explorezi datele?{" "}
        <Link to="/national" className="font-semibold text-brand underline underline-offset-4">
          Vezi situația națională →
        </Link>
      </p>
    </main>
  );
}
