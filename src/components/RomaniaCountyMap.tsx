import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { MapZoomControls } from "@/components/MapZoomControls";
import { romaniaCountyShapes, type RomaniaCountyShape } from "@/data/geo/romaniaCounties";
import { useSvgPanZoom } from "@/hooks/use-svg-pan-zoom";
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
  const [selectedCounty, setSelectedCounty] = useState<RomaniaCountyShape | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<RomaniaCountyShape | null>(null);
  const zoom = useSvgPanZoom({ width: 900, height: 900, centerX: 450, centerY: 310 });
  const statsByCounty = new Map(counties.map((county) => [county.county, county]));
  const activeCounty = hoveredCounty ?? selectedCounty;
  const activeName = activeCounty ? displayName(activeCounty.name) : null;
  const activeStats = activeName ? statsByCounty.get(activeName) : undefined;
  const activePerformance = getCountyPerformanceColor(activeStats?.enAverage);

  return (
    <div className="mx-auto mt-5 grid w-full max-w-[1040px] gap-5 lg:grid-cols-[minmax(0,680px)_minmax(240px,1fr)] lg:items-start">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-md border-2 border-line bg-paper"
        style={{ aspectRatio: "1 / 1" }}
      >
        <MapZoomControls
          scale={zoom.scale}
          onZoomIn={zoom.zoomIn}
          onZoomOut={zoom.zoomOut}
          onReset={zoom.reset}
        />
        <svg
          viewBox="0 -140 900 900"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 block h-full w-full"
          role="img"
          aria-labelledby="romania-map-title romania-map-description"
          {...zoom.interactionProps}
        >
          <title id="romania-map-title">Harta rezultatelor pe județe</title>
          <desc id="romania-map-description">
            Harta României cu toate cele 41 de județe și municipiul București, colorate după media
            Evaluării Naționale 2026. Selectarea unui județ afișează detaliile sale.
          </desc>

          <g transform={zoom.transform}>
            {romaniaCountyShapes.map((shape) => {
              const countyName = displayName(shape.name);
              const stats = statsByCounty.get(countyName);
              const performance = getCountyPerformanceColor(stats?.enAverage);
              const label = COUNTY_LABELS[shape.name] ?? countyName.slice(0, 2).toUpperCase();
              const isActive = activeCounty?.name === shape.name;
              const isSelected = selectedCounty?.name === shape.name;

              return (
                <g
                  key={shape.name}
                  role="button"
                  tabIndex={0}
                  aria-label={`${countyName}: ${stats ? `media ${formatGrade(stats.enAverage)}` : "date indisponibile"}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCounty(shape)}
                  onMouseEnter={() => setHoveredCounty(shape)}
                  onMouseLeave={() => setHoveredCounty(null)}
                  onFocus={() => setHoveredCounty(shape)}
                  onBlur={() => setHoveredCounty(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedCounty(shape);
                    }
                  }}
                  className="cursor-pointer outline-none"
                >
                  <path
                    d={shape.path}
                    className={`${performance?.mapClass ?? "fill-line"} stroke-card transition-[opacity,filter] duration-150 hover:brightness-95`}
                    fillOpacity={isActive ? 1 : 0.76}
                    stroke={isSelected ? "#525252" : undefined}
                    strokeWidth={isSelected ? 3 : isActive ? 2.2 : 1.5}
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
                </g>
              );
            })}
          </g>
        </svg>
        <p className="pointer-events-none absolute bottom-3 right-3 hidden rounded-md bg-card/90 px-3 py-2 text-sm font-medium text-sub sm:block">
          România · selectează un județ
        </p>
      </div>

      <aside
        className="min-h-52 rounded-md border-2 border-line bg-card p-5 lg:min-h-[420px]"
        aria-live="polite"
        aria-label="Detaliile județului selectat"
      >
        {activeCounty && activeName ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sub">Județ selectat</p>
            <h3 className="mt-2 font-display text-2xl font-bold">{activeName}</h3>
            {activeStats ? (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <MapDetail
                  label="Media EN"
                  value={formatGrade(activeStats.enAverage)}
                  valueClassName={activePerformance?.textClass}
                />
                <MapDetail label="Școli" value={formatCount(activeStats.schoolCount)} />
                <MapDetail label="Absolvenți" value={formatCount(activeStats.graduates)} />
                <MapDetail label="Media România" value={formatGrade(nationalAverage)} />
              </div>
            ) : (
              <p className="mt-4 text-base text-sub">Date indisponibile în setul demonstrativ.</p>
            )}
            <Link
              to="/county/$county"
              params={{ county: slugify(activeName) }}
              className="mt-6 inline-flex min-h-11 items-center border-t border-line pt-5 font-semibold text-brand underline underline-offset-4"
            >
              Vezi situația județului
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sub">
              Hartă interactivă
            </p>
            <h3 className="mt-2 font-display text-xl font-bold">Alege un județ</h3>
            <p className="mt-3 text-base leading-relaxed text-sub">
              Selectează un județ pentru a vedea media, numărul de școli și absolvenții incluși.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function MapDetail({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-md bg-paper p-3">
      <p className="text-xs font-semibold text-sub">{label}</p>
      <p className={`mt-1 font-display text-xl font-bold ${valueClassName}`}>{value}</p>
    </div>
  );
}
