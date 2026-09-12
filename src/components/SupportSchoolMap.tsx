import { Link } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useMemo, useState } from "react";

import { romaniaCountyShapes } from "@/data/geo/romaniaCounties";
import { projectPoint } from "@/lib/geo";
import type { Ngo } from "@/lib/model";
import { formatCount, formatGrade, getSchoolPerformanceColor } from "@/lib/risk";
import { buildNgoToSchoolEmailDraft } from "@/lib/schoolEmail";
import type { PrioritySchool, SupportScope } from "@/lib/schoolSupport";

type Props = {
  schools: PrioritySchool[];
  ngo: Ngo;
  scope: SupportScope;
};

function displayName(name: string) {
  return name === "Bucharest" ? "București" : name;
}

function countyFill(priorityCount: number) {
  if (priorityCount >= 100) return "#9d2e2e";
  if (priorityCount >= 50) return "#c96a43";
  if (priorityCount >= 20) return "#e5a65b";
  if (priorityCount > 0) return "#f4d9a2";
  return "#d8e2cf";
}

export function SupportSchoolMap({ schools, ngo, scope }: Props) {
  const [activeSchoolId, setActiveSchoolId] = useState<string | null>(null);
  const countyPriority = useMemo(() => {
    const result = new Map<string, number>();
    schools.forEach(({ school, alerts }) => {
      if (school.enAverage < 5 || alerts.length > 0) {
        result.set(school.county, (result.get(school.county) ?? 0) + 1);
      }
    });
    return result;
  }, [schools]);
  const markers = useMemo(
    () =>
      schools
        .filter(({ school }) => school.latitude !== null && school.longitude !== null)
        .map((item) => ({
          ...item,
          ...projectPoint(item.school.latitude as number, item.school.longitude as number),
        })),
    [schools],
  );
  const activeSchool =
    markers.find(({ school }) => school.id === activeSchoolId) ?? markers[0] ?? null;
  const emailDraft = activeSchool
    ? buildNgoToSchoolEmailDraft({
        ngo,
        school: activeSchool.school,
        alerts: activeSchool.alerts,
      })
    : null;

  return (
    <div className="mx-auto w-full max-w-[920px]">
      <div className="border-y-2 border-line bg-paper px-2 py-4 sm:px-5 sm:py-6">
        <svg
          viewBox="0 8 900 455"
          preserveAspectRatio="xMidYMid meet"
          className="block h-auto w-full"
          role="img"
          aria-labelledby="support-map-title support-map-description"
        >
          <title id="support-map-title">
            {scope === "county" ? `Școlile din județul ${ngo.county}` : "Școlile din România"}
          </title>
          <desc id="support-map-description">
            Selectează un marcaj pentru detalii și contactarea școlii.
          </desc>

          {romaniaCountyShapes.map((shape) => {
            const county = displayName(shape.name);
            const selected = scope === "county" && county === ngo.county;
            const priority = countyPriority.get(county) ?? 0;
            return (
              <path
                key={shape.name}
                d={shape.path}
                fill={scope === "national" || selected ? countyFill(priority) : "#f5f5f5"}
                fillOpacity={selected ? 1 : 0.82}
                stroke={selected ? "#0a0a0a" : "#ffffff"}
                strokeWidth={selected ? 4 : 1.5}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {markers.map(({ school, alerts, x, y }) => {
            const active = school.id === activeSchool?.school.id;
            const color = getSchoolPerformanceColor(school.enAverage)?.color ?? "#525252";
            return (
              <g
                key={school.id}
                role="button"
                tabIndex={0}
                aria-label={`${school.schoolName}, media ${formatGrade(school.enAverage)}`}
                aria-pressed={active}
                onClick={() => setActiveSchoolId(school.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveSchoolId(school.id);
                  }
                }}
                onMouseEnter={() => setActiveSchoolId(school.id)}
                onFocus={() => setActiveSchoolId(school.id)}
                className="cursor-pointer outline-none"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={active ? 8 : alerts.length > 0 ? 6 : 4.5}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={active ? 3 : 2}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 min-h-28 border-l-4 border-brand pl-4">
        {activeSchool && emailDraft ? (
          <>
            <p className="font-bold leading-snug">{activeSchool.school.schoolName}</p>
            <p className="mt-1 text-sm text-sub">
              {activeSchool.school.locality ?? activeSchool.school.county} · Media EN{" "}
              {formatGrade(activeSchool.school.enAverage)}
              {activeSchool.alerts.length > 0
                ? ` · ${formatCount(activeSchool.alerts.length)} nevoi raportate`
                : " · fără raportări HartaEdu"}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
              <Link
                to="/school/$schoolId"
                params={{ schoolId: activeSchool.school.id }}
                search={{ ngoId: ngo.id, scope }}
                className="inline-flex min-h-10 items-center text-brand underline underline-offset-4"
              >
                Vezi școala
              </Link>
              <a
                href={emailDraft.mailtoUrl}
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-brand px-4 text-card"
              >
                <Send size={17} aria-hidden /> Contactează prin email
              </a>
            </div>
          </>
        ) : (
          <>
            <p className="font-bold">Nicio școală poziționată pe hartă</p>
            <p className="mt-1 text-sm text-sub">
              Rezultatele fără coordonate rămân disponibile în vizualizarea listă.
            </p>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3 text-sm text-sub">
        <span>Culoarea județului indică numărul de școli prioritare.</span>
        <span>Culoarea punctului indică rezultatul la Evaluarea Națională.</span>
        <span>Punctele mai mari au nevoi HartaEdu.</span>
      </div>
    </div>
  );
}
