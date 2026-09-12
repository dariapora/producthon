import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { romaniaCountyShapes } from "@/data/geo/romaniaCounties";
import { pathBounds, projectPoint } from "@/lib/geo";
import { hasHartaEduAlerts } from "@/lib/hartaedu";
import type { School } from "@/lib/model";
import { EmptyState } from "@/components/ui/Panel";
import { MapZoomControls } from "@/components/MapZoomControls";
import { useSvgPanZoom } from "@/hooks/use-svg-pan-zoom";
import { formatDelta, formatGrade, getSchoolPerformanceColor } from "@/lib/risk";

type Props = {
  county: string;
  schools: School[];
  countyAverage: number | null;
  previousAverages: Record<string, number | null>;
  totalSchools: number;
};

type Marker = {
  school: School;
  x: number;
  y: number;
};

function shapeForCounty(county: string) {
  const target = county === "București" ? "Bucharest" : county;
  return romaniaCountyShapes.find((shape) => shape.name === target) ?? null;
}

export function CountySchoolMap({
  county,
  schools,
  countyAverage,
  previousAverages,
  totalSchools,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const shape = shapeForCounty(county);

  const { viewBox, markers, size, centerX, centerY, width, height } = useMemo(() => {
    if (!shape) {
      return {
        viewBox: "0 0 100 100",
        markers: [] as Marker[],
        size: 100,
        centerX: 50,
        centerY: 50,
        width: 100,
        height: 100,
      };
    }
    const b = pathBounds(shape.path);
    const pad = Math.max((b.maxX - b.minX) * 0.08, 6);
    const width = b.maxX - b.minX + pad * 2;
    const height = b.maxY - b.minY + pad * 2;

    const used = new Map<string, number>();
    const list: Marker[] = schools.map((school) => {
      const point = projectPoint(school.latitude as number, school.longitude as number);
      const key = `${point.x.toFixed(2)}:${point.y.toFixed(2)}`;
      const seen = used.get(key) ?? 0;
      used.set(key, seen + 1);
      // decalaj vizual minim pentru școlile din aceeași localitate
      const angle = seen * 1.9;
      const radius = seen === 0 ? 0 : Math.max(width * 0.012, 1.6) * (1 + seen * 0.18);
      return {
        school,
        x: point.x + Math.cos(angle) * radius,
        y: point.y + Math.sin(angle) * radius,
      };
    });

    return {
      viewBox: `${b.minX - pad} ${b.minY - pad} ${width} ${height}`,
      markers: list,
      size: Math.max(width, height),
      centerX: b.minX - pad + width / 2,
      centerY: b.minY - pad + height / 2,
      width,
      height,
    };
  }, [shape, schools]);

  const zoom = useSvgPanZoom({ width, height, centerX, centerY });

  if (!shape) {
    return <EmptyState title="Conturul județului nu este disponibil" />;
  }

  if (markers.length === 0) {
    return (
      <EmptyState
        title="Nicio școală cu coordonate cunoscute în acest județ"
        note="Pe hartă apar doar școlile pentru care avem localizare confirmată. Lista completă rămâne mai jos."
      />
    );
  }

  const active = markers.find((m) => m.school.id === activeId) ?? null;
  const markerRadius = Math.max(size * 0.014, 1.4);

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-md bg-paper">
        <MapZoomControls
          scale={zoom.scale}
          onZoomIn={zoom.zoomIn}
          onZoomOut={zoom.zoomOut}
          onReset={zoom.reset}
        />
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="block h-[420px] w-full sm:h-[520px]"
          role="img"
          aria-label={`Harta școlilor din județul ${county}`}
          {...zoom.interactionProps}
        >
          <g transform={zoom.transform}>
            <path
              d={shape.path}
              className="fill-card stroke-line"
              strokeWidth={1.6}
              vectorEffect="non-scaling-stroke"
            />
            {markers.map((marker) => {
              const meta = getSchoolPerformanceColor(marker.school.enAverage);
              const isActive = marker.school.id === activeId;
              const flagged = hasHartaEduAlerts(marker.school.county, marker.school.schoolName);
              return (
                <g
                  key={marker.school.id}
                  onMouseEnter={() => setActiveId(marker.school.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onClick={() => setActiveId(marker.school.id)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={isActive ? markerRadius * 1.5 : markerRadius}
                    fill={meta?.color ?? "#737373"}
                    stroke="#FFFFFF"
                    strokeWidth={1.2}
                    vectorEffect="non-scaling-stroke"
                    opacity={0.95}
                  />
                  {flagged ? (
                    <circle
                      cx={marker.x + markerRadius * 1.1}
                      cy={marker.y - markerRadius * 1.1}
                      r={markerRadius * 0.6}
                      fill="#0A0A0A"
                      stroke="#FFFFFF"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                  ) : null}
                </g>
              );
            })}
          </g>
        </svg>
        <p className="pointer-events-none absolute bottom-3 right-3 hidden rounded-md bg-card/90 px-3 py-2 text-sm font-medium text-sub sm:block">
          Folosește butoanele pentru zoom · trage pentru deplasare
        </p>
      </div>

      {active ? (
        <SchoolTooltip
          school={active.school}
          countyAverage={countyAverage}
          previousAverage={previousAverages[active.school.id] ?? null}
        />
      ) : null}

      <p className="mt-3 text-sm font-medium text-sub">
        {markers.length} din {totalSchools} școli poziționate · culoarea indică doar media EN
      </p>
    </div>
  );
}

function SchoolTooltip({
  school,
  countyAverage,
  previousAverage,
}: {
  school: School;
  countyAverage: number | null;
  previousAverage: number | null;
}) {
  const meta = getSchoolPerformanceColor(school.enAverage);
  const alerts = hasHartaEduAlerts(school.county, school.schoolName);
  const delta = previousAverage !== null ? school.enAverage - previousAverage : null;

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 right-4 z-10 max-w-sm rounded-md bg-ink px-5 py-4 text-card shadow-xl sm:right-auto">
      <p className="font-display text-lg font-bold leading-tight">{school.schoolName}</p>
      {school.locality && <p className="text-sm opacity-70">{school.locality}</p>}
      <p className="mt-2 text-sm">Media EN 2026: {formatGrade(school.enAverage)}</p>
      {meta && (
        <p className="mt-1 flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
          {meta.label}
        </p>
      )}
      <p className="mt-1 text-sm opacity-80">Media județ: {formatGrade(countyAverage)}</p>
      {delta !== null && <p className="text-sm opacity-80">Față de 2025: {formatDelta(delta)}</p>}
      {alerts && (
        <p className="mt-2 inline-flex rounded-md bg-card/15 px-3 py-1 text-xs font-semibold">
          Nevoi raportate pe HartaEdu
        </p>
      )}
      <Link
        to="/school/$schoolId"
        params={{ schoolId: school.id }}
        className="mt-3 block text-sm font-semibold underline underline-offset-4"
      >
        Vezi detaliile școlii →
      </Link>
    </div>
  );
}
