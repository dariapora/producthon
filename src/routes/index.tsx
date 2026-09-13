import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, GraduationCap, HeartHandshake } from "lucide-react";

import { Footer } from "@/components/layout/Footer";

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
    icon: GraduationCap,
    title: "Sunt director",
    description: "Vreau să găsesc ajutor pentru școala mea.",
    to: "/find-school" as const,
    accent: "blue",
  },
  {
    key: "support",
    icon: HeartHandshake,
    title: "Reprezint un ONG",
    description: "Vreau să ofer ajutor.",
    to: "/support" as const,
    accent: "red",
  },
] as const;

const ACCENT_STYLES = {
  blue: {
    iconBg: "bg-[#2563EB]",
    iconColor: "text-white",
    arrowBg: "bg-[#2563EB] group-hover:bg-[#1D4ED8]",
    arrowColor: "text-white",
  },
  red: {
    iconBg: "bg-[#DC2626]",
    iconColor: "text-white",
    arrowBg: "bg-[#DC2626] group-hover:bg-[#B91C1C]",
    arrowColor: "text-white",
  },
} as const;

function HomePage() {
  return (
    <main className="relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-16">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url(/imagine-hero.jpg)", filter: "brightness(1.05) saturate(1.1)" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-[1040px] text-center">
        <header className="mx-auto max-w-[680px]">
          <h1 className="text-balance text-[36px] font-extrabold leading-[1.15] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)] sm:text-[52px]">
            Cum vrei să ajuți
            <br />
            <span className="relative inline-block text-[#EAB308]">
              educația?
              <svg
                viewBox="0 0 220 20"
                className="absolute -bottom-2 left-0 h-3 w-full text-[#EAB308]"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M4 10 Q110 20 216 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
        </header>

        <section
          className="mx-auto mt-10 grid gap-5 min-[860px]:grid-cols-2 min-[860px]:gap-6"
          aria-label="Alege ce vrei să faci"
        >
          {JOURNEYS.map((item) => {
            const Icon = item.icon;
            const accent = ACCENT_STYLES[item.accent];
            return (
              <Link
                key={item.key}
                to={item.to}
                className="group flex min-h-[220px] items-center gap-4 rounded-[24px] bg-white p-8 text-left shadow-[0_8px_30px_rgba(0,0,0,0.10)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(0,0,0,0.14)] sm:p-9"
              >
                <div className="min-w-0 flex-1">
                  <span
                    className={`grid size-16 shrink-0 place-items-center rounded-full ${accent.iconBg} ${accent.iconColor}`}
                  >
                    <Icon size={30} aria-hidden />
                  </span>
                  <span className="mt-4 block text-[20px] font-bold leading-snug text-[#14213D] sm:text-[22px]">
                    {item.title}
                  </span>
                  <span className="mt-2 block max-w-[38ch] text-[16px] leading-relaxed text-[#5F6368] sm:text-[17px]">
                    {item.description}
                  </span>
                </div>
                <span
                  className={`grid size-13 shrink-0 place-items-center self-center rounded-full transition-all duration-200 ease-out group-hover:translate-x-1 ${accent.arrowBg} ${accent.arrowColor}`}
                  style={{ width: 52, height: 52 }}
                  aria-hidden
                >
                  <ChevronRight size={24} />
                </span>
              </Link>
            );
          })}
        </section>

        <p className="mt-8 text-base text-white/80">
          Vrei doar să explorezi datele?{" "}
          <Link
            to="/national"
            className="font-semibold text-white underline decoration-2 underline-offset-4 transition-colors hover:text-[#DCEBFF]"
          >
            Vezi situația națională →
          </Link>
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0">
        <Footer variant="light" />
      </div>
    </main>
  );
}
