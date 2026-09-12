import { Link } from "@tanstack/react-router";
import { Building2, Send } from "lucide-react";
import { useMemo, useState, type MouseEvent } from "react";

import { MapZoomControls } from "@/components/MapZoomControls";
import { romaniaCountyShapes } from "@/data/geo/romaniaCounties";
import { useSvgPanZoom } from "@/hooks/use-svg-pan-zoom";
import { pathBounds, projectPoint } from "@/lib/geo";
import type { Ngo } from "@/lib/model";
import { formatCount, formatGrade, getSchoolPerformanceColor } from "@/lib/risk";
import { buildNgoToSchoolEmailDraft } from "@/lib/schoolEmail";
import type { PrioritySchool, SupportScope } from "@/lib/schoolSupport";

type Props = { schools: PrioritySchool[]; ngo: Ngo; scope: SupportScope };
const NATIONAL_SIZE = 900;

function displayName(name: string) {
  return name === "Bucharest" ? "București" : name;
}

function initialViewport(county: string, scope: SupportScope) {
  if (scope === "national") {
    return {
      viewBox: `0 -140 ${NATIONAL_SIZE} ${NATIONAL_SIZE}`,
      size: NATIONAL_SIZE,
      centerX: NATIONAL_SIZE / 2,
      centerY: 310,
    };
  }
  const shape = romaniaCountyShapes.find((item) => displayName(item.name) === county);
  if (!shape) return initialViewport(county, "national");
  const bounds = pathBounds(shape.path);
  const size = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 1.25;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  return {
    viewBox: `${centerX - size / 2} ${centerY - size / 2} ${size} ${size}`,
    size,
    centerX,
    centerY,
  };
}

function countyFill(priorityCount: number) {
  if (priorityCount >= 100) return "#9d2e2e";
  if (priorityCount >= 50) return "#c96a43";
  if (priorityCount >= 20) return "#e5a65b";
  if (priorityCount > 0) return "#f4d9a2";
  return "#ffffff";
}

export function SupportSchoolMap({ schools, ngo, scope }: Props) {
  const viewport = initialViewport(ngo.county, scope);
  const zoom = useSvgPanZoom({
    width: viewport.size,
    height: viewport.size,
    centerX: viewport.centerX,
    centerY: viewport.centerY,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ id: string; left: number; top: number } | null>(null);
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
  const selected = markers.find(({ school }) => school.id === selectedId) ?? null;
  const hovered = tooltip ? (markers.find(({ school }) => school.id === tooltip.id) ?? null) : null;
  const ngoMarker =
    ngo.latitude !== null && ngo.longitude !== null
      ? projectPoint(ngo.latitude, ngo.longitude)
      : null;
  const emailDraft = selected
    ? buildNgoToSchoolEmailDraft({ ngo, school: selected.school, alerts: selected.alerts })
    : null;

  function showTooltip(event: MouseEvent<SVGGElement>, id: string) {
    const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!bounds) return;
    setTooltip({
      id,
      left: Math.max(8, Math.min(event.clientX - bounds.left + 12, bounds.width - 230)),
      top: Math.max(8, Math.min(event.clientY - bounds.top + 12, bounds.height - 64)),
    });
  }

  return (
    <div
      className={`mx-auto grid w-full gap-5 ${
        scope === "national"
          ? "grid-cols-1"
          : "max-w-[1040px] lg:grid-cols-[minmax(0,680px)_minmax(280px,1fr)] lg:items-start"
      }`}
    >
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
          viewBox={viewport.viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 block h-full w-full"
          role="img"
          aria-labelledby="support-map-title support-map-description"
          {...zoom.interactionProps}
        >
          <title id="support-map-title">
            {scope === "county" ? `Școlile din județul ${ngo.county}` : "Școlile din România"}
          </title>
          <desc id="support-map-description">
            Selectează un marcaj pentru a afișa detaliile școlii în panoul de detalii.
          </desc>
          <g transform={zoom.transform}>
            {romaniaCountyShapes.map((shape) => {
              const county = displayName(shape.name);
              const selectedCounty = county === ngo.county;
              const priority = countyPriority.get(county) ?? 0;
              return (
                <path
                  key={shape.name}
                  d={shape.path}
                  fill={
                    scope === "national"
                      ? countyFill(priority)
                      : selectedCounty
                        ? "#f4d9a2"
                        : "#ffffff"
                  }
                  stroke={selectedCounty ? "#9d2e2e" : "#d7d7d2"}
                  strokeWidth={selectedCounty ? 2.5 : 1.2}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            {markers.map((marker) => {
              const isSelected = marker.school.id === selected?.school.id;
              const isHovered = marker.school.id === hovered?.school.id;
              const color = getSchoolPerformanceColor(marker.school.enAverage)?.color ?? "#525252";
              return (
                <g
                  key={marker.school.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${marker.school.schoolName}, media ${formatGrade(marker.school.enAverage)}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(marker.school.id)}
                  onMouseEnter={(event) => showTooltip(event, marker.school.id)}
                  onMouseMove={(event) => showTooltip(event, marker.school.id)}
                  onMouseLeave={() => setTooltip(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(marker.school.id);
                    }
                  }}
                  className="cursor-pointer outline-none"
                >
                  <title>{marker.school.schoolName}</title>
                  <circle cx={marker.x} cy={marker.y} r={7} fill="transparent" />
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={isSelected ? 4 : isHovered ? 3.5 : 2.5}
                    fill={color}
                    stroke={isSelected ? "#525252" : "#ffffff"}
                    strokeWidth={isSelected ? 2.2 : 1.1}
                    vectorEffect="non-scaling-stroke"
                  />
                  {marker.alerts.length > 0 ? (
                    <circle
                      cx={marker.x + 3}
                      cy={marker.y - 3}
                      r={1.4}
                      fill="#0a0a0a"
                      stroke="#ffffff"
                      strokeWidth={0.8}
                      vectorEffect="non-scaling-stroke"
                    />
                  ) : null}
                </g>
              );
            })}

            {ngoMarker ? (
              <g aria-label={`${ngo.name}, ${ngo.locality}`} role="img">
                <circle
                  cx={ngoMarker.x}
                  cy={ngoMarker.y}
                  r={4.5}
                  fill="#ffffff"
                  stroke="#525252"
                  strokeWidth={1.1}
                  vectorEffect="non-scaling-stroke"
                />
                <Building2
                  x={ngoMarker.x - 3}
                  y={ngoMarker.y - 3}
                  width={6}
                  height={6}
                  color="#525252"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  aria-hidden
                />
              </g>
            ) : null}
          </g>
        </svg>
        <p className="pointer-events-none absolute bottom-3 right-3 hidden rounded-md bg-card/90 px-3 py-2 text-sm font-medium text-sub sm:block">
          {scope === "county" ? `Județul ${ngo.county}` : "România"}
        </p>
        {hovered && tooltip ? (
          <div
            className="pointer-events-none absolute z-30 max-w-[220px] rounded-md bg-ink px-3 py-2 text-xs font-semibold leading-snug text-card shadow-lg"
            style={{ left: tooltip.left, top: tooltip.top }}
          >
            {hovered.school.schoolName} · media {formatGrade(hovered.school.enAverage)}
          </div>
        ) : null}
      </div>

      <aside
        className={`min-h-52 rounded-md border-2 border-line bg-card p-5 ${
          scope === "county" ? "lg:min-h-[420px]" : ""
        }`}
        aria-live="polite"
        aria-label="Detaliile școlii selectate"
      >
        {selected && emailDraft ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sub">
              Școală selectată
            </p>
            <h3 className="mt-2 font-display text-xl font-bold leading-tight">
              {selected.school.schoolName}
            </h3>
            <p className="mt-3 text-sm text-sub">
              {selected.school.locality ?? selected.school.county}, {selected.school.county}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MapDetail label="Media EN" value={formatGrade(selected.school.enAverage)} />
              <MapDetail label="Absolvenți" value={formatCount(selected.school.graduates)} />
              <MapDetail label="Nevoi raportate" value={formatCount(selected.alerts.length)} />
              <MapDetail
                label="Prioritate"
                value={selected.urgency > 0 ? "Ridicată" : "Standard"}
              />
            </div>
            <div className="mt-6 grid gap-3 border-t border-line pt-5 text-sm font-semibold">
              <Link
                to="/school/$schoolId"
                params={{ schoolId: selected.school.id }}
                search={{ ngoId: ngo.id, scope }}
                className="inline-flex min-h-11 items-center text-brand underline underline-offset-4"
              >
                Vezi detaliile școlii
              </Link>
              <a
                href={emailDraft.mailtoUrl}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand px-4 text-card"
              >
                <Send size={17} aria-hidden /> Contactează prin email
              </a>
            </div>
          </div>
        ) : markers.length === 0 ? (
          <div>
            <p className="font-bold">Nicio școală poziționată pe hartă</p>
            <p className="mt-2 text-sm text-sub">
              Rezultatele fără coordonate rămân disponibile în vizualizarea listă.
            </p>
          </div>
        ) : (
          <div>
            <p className="font-bold">Selectează o școală de pe hartă</p>
            <p className="mt-2 text-sm text-sub">
              Apasă pe un marcaj pentru a vedea detaliile școlii și opțiunile de contact.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function MapDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-paper px-3 py-3">
      <p className="text-xs font-semibold text-sub">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
