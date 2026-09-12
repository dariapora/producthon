import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { romaniaCountyShapes, type RomaniaCountyShape } from "@/data/geo/romaniaCounties";
import { slugify } from "@/lib/dataset";
import type { CountyStats } from "@/lib/model";
import { formatCount, formatGrade, getCountyPerformanceColor } from "@/lib/risk";

const COUNTY_LABELS: Record<string, string> = {
  Alba: "AB",
  Arad: "AR",
  Argeș: "AG",
  Bacău: "BC",
  Bihor: "BH",
  "Bistrița-Năsăud": "BN",
  Botoșani: "BT",
  Brașov: "BV",
  Brăila: "BR",
  Bucharest: "B",
  Buzău: "BZ",
  Călărași: "CL",
  "Caraș-Severin": "CS",
  Cluj: "CJ",
  Constanța: "CT",
  Covasna: "CV",
  Dâmbovița: "DB",
  Dolj: "DJ",
  Galați: "GL",
  Giurgiu: "GR",
  Gorj: "GJ",
  Harghita: "HR",
  Hunedoara: "HD",
  Iași: "IS",
  Ialomița: "IL",
  Ilfov: "IF",
  Maramureș: "MM",
  Mehedinți: "MH",
  Mureș: "MS",
  Neamț: "NT",
  Olt: "OT",
  Prahova: "PH",
  Sălaj: "SJ",
  "Satu Mare": "SM",
  Sibiu: "SB",
  Suceava: "SV",
  Teleorman: "TR",
  Timiș: "TM",
  Tulcea: "TL",
  Vâlcea: "VL",
  Vaslui: "VS",
  Vrancea: "VN",
};

function displayName(name: string) {
  return name === "Bucharest" ? "București" : name;
}

type Props = {
  counties: CountyStats[];
  nationalAverage: number;
};

export function RomaniaCountyMap({ counties, nationalAverage }: Props) {
  const [activeCounty, setActiveCounty] = useState<RomaniaCountyShape | null>(null);
  const statsByCounty = new Map(counties.map((county) => [county.county, county]));
  const activeName = activeCounty ? displayName(activeCounty.name) : null;
  const activeStats = activeName ? statsByCounty.get(activeName) : undefined;
  const activePerformance = getCountyPerformanceColor(activeStats?.enAverage);

  return (
    <div className="mt-5">
      <div className="overflow-hidden rounded-md border border-line bg-paper px-2 py-4 sm:px-5 sm:py-6">
        <svg
          viewBox="0 8 900 455"
          preserveAspectRatio="xMidYMid meet"
          className="block h-auto w-full"
          role="img"
          aria-labelledby="romania-map-title romania-map-description"
        >
          <title id="romania-map-title">Harta rezultatelor pe județe</title>
          <desc id="romania-map-description">
            Harta României cu toate cele 41 de județe și municipiul București, colorate după media
            Evaluării Naționale 2026. Selectarea unui județ deschide pagina sa.
          </desc>

          {romaniaCountyShapes.map((shape) => {
            const countyName = displayName(shape.name);
            const stats = statsByCounty.get(countyName);
            const performance = getCountyPerformanceColor(stats?.enAverage);
            const label = COUNTY_LABELS[shape.name] ?? countyName.slice(0, 2).toUpperCase();
            const isActive = activeCounty?.name === shape.name;

            return (
              <Link
                key={shape.name}
                to="/county/$county"
                params={{ county: slugify(countyName) }}
                className="group"
                aria-label={`${countyName}: ${stats ? `media ${formatGrade(stats.enAverage)}` : "date indisponibile"}`}
                onMouseEnter={() => setActiveCounty(shape)}
                onMouseLeave={() => setActiveCounty(null)}
                onFocus={() => setActiveCounty(shape)}
                onBlur={() => setActiveCounty(null)}
              >
                <path
                  d={shape.path}
                  className={`${performance?.mapClass ?? "fill-line"} stroke-card transition-[opacity,filter] duration-150 group-hover:brightness-95`}
                  fillOpacity={isActive ? 1 : 0.76}
                  strokeWidth={isActive ? 3 : 1.5}
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={shape.labelX}
                  y={shape.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none fill-card font-mono text-[10px] font-bold tracking-wide"
                >
                  {label}
                </text>
              </Link>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 min-h-24 border-l-4 border-brand pl-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
        {activeCounty && activeName ? (
          <>
            <div>
              <p className="text-sm font-semibold text-sub">Județul {activeName}</p>
              {activeStats ? (
                <p className="mt-1 text-base text-sub">
                  {formatCount(activeStats.schoolCount)} școli ·{" "}
                  {formatCount(activeStats.graduates)} absolvenți
                </p>
              ) : (
                <p className="mt-1 text-base text-sub">Date indisponibile în setul demonstrativ</p>
              )}
            </div>
            {activeStats ? (
              <div className="mt-3 flex items-baseline gap-3 sm:mt-0 sm:text-right">
                <span
                  className={`font-display text-3xl font-bold ${activePerformance?.textClass ?? ""}`}
                >
                  {formatGrade(activeStats.enAverage)}
                </span>
                <span className="text-sm text-sub">
                  media EN · România {formatGrade(nationalAverage)}
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <div>
            <p className="font-semibold text-ink">Alege un județ de pe hartă</p>
            <p className="mt-1 text-base text-sub">
              Vezi media, numărul de școli și pagina cu rezultate detaliate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
