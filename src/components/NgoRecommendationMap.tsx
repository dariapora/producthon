import { Building2, GraduationCap } from "lucide-react";
import { useState, type MouseEvent } from "react";

import { MapZoomControls } from "@/components/MapZoomControls";
import { NgoContactDialog } from "@/components/NgoContactDialog";
import { RecommendationScoreBadge } from "@/components/RecommendationScoreBadge";
import { romaniaCountyShapes } from "@/data/geo/romaniaCounties";
import { getMockNgoEmail, getNgoContact } from "@/data/enrichment/ngoContactEnrichment";
import { useSvgPanZoom } from "@/hooks/use-svg-pan-zoom";
import { formatKm } from "@/lib/distance";
import { pathBounds, projectPoint } from "@/lib/geo";
import type { CountyStats, NationalStats, School } from "@/lib/model";
import { buildSchoolEmailDraft } from "@/lib/ngoEmail";
import type { NgoRecommendation } from "@/lib/ngoRecommendations";
import { recommendationScoreColor } from "@/lib/recommendationScore";

type Props = {
  recommendations: NgoRecommendation[];
  school: School;
  county: CountyStats | null;
  national: NationalStats;
  showNational: boolean;
};

const NATIONAL_SIZE = 900;

function displayName(name: string) {
  return name === "Bucharest" ? "București" : name;
}

function initialViewport(county: string, showNational: boolean) {
  if (showNational) {
    return {
      viewBox: `0 -140 ${NATIONAL_SIZE} ${NATIONAL_SIZE}`,
      size: NATIONAL_SIZE,
      centerX: NATIONAL_SIZE / 2,
      centerY: 310,
    };
  }

  const shape = romaniaCountyShapes.find((item) => displayName(item.name) === county);
  if (!shape) return initialViewport(county, true);

  const bounds = pathBounds(shape.path);
  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;
  const size = Math.max(contentWidth, contentHeight) * 1.25;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  return {
    viewBox: `${centerX - size / 2} ${centerY - size / 2} ${size} ${size}`,
    size,
    centerX,
    centerY,
  };
}

export function NgoRecommendationMap({
  recommendations,
  school,
  county,
  national,
  showNational,
}: Props) {
  const nationalView =
    showNational && recommendations.some((recommendation) => !recommendation.sameCounty);
  const viewport = initialViewport(school.county, nationalView);
  const zoom = useSvgPanZoom({
    width: viewport.size,
    height: viewport.size,
    centerX: viewport.centerX,
    centerY: viewport.centerY,
  });
  const markers = recommendations
    .filter(({ ngo }) => ngo.latitude !== null && ngo.longitude !== null)
    .map((item) => ({
      ...item,
      ...projectPoint(item.ngo.latitude as number, item.ngo.longitude as number),
    }));
  const [selectedId, setSelectedId] = useState<string | null>(markers[0]?.ngo.id ?? null);
  const [tooltip, setTooltip] = useState<{
    id: string;
    left: number;
    top: number;
  } | null>(null);
  const selected = markers.find(({ ngo }) => ngo.id === selectedId) ?? markers[0] ?? null;
  const hovered = tooltip ? (markers.find(({ ngo }) => ngo.id === tooltip.id) ?? null) : null;
  const schoolPoint =
    school.latitude !== null && school.longitude !== null
      ? projectPoint(school.latitude, school.longitude)
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
    <div className="mx-auto grid w-full max-w-[1040px] gap-5 lg:grid-cols-[minmax(0,680px)_minmax(280px,1fr)] lg:items-start">
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
          aria-labelledby="ngo-map-title ngo-map-description"
          {...zoom.interactionProps}
        >
          <title id="ngo-map-title">
            {nationalView
              ? "Harta organizațiilor potrivite din România"
              : `Harta organizațiilor potrivite din județul ${school.county}`}
          </title>
          <desc id="ngo-map-description">
            Organizațiile sunt poziționate aproximativ după localitatea sau județul declarat.
            Selectează un marcaj pentru detalii.
          </desc>

          <g transform={zoom.transform}>
            {romaniaCountyShapes.map((shape) => {
              const selectedCounty = displayName(shape.name) === school.county;
              return (
                <path
                  key={shape.name}
                  d={shape.path}
                  fill={selectedCounty ? "#f4d9a2" : "#ffffff"}
                  stroke={selectedCounty ? "#9d2e2e" : "#d7d7d2"}
                  strokeWidth={selectedCounty ? 2.5 : 1.2}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

            {markers.map((marker) => {
              const isSelected = marker.ngo.id === selected?.ngo.id;
              const isHovered = marker.ngo.id === hovered?.ngo.id;
              return (
                <g
                  key={marker.ngo.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${marker.ngo.name}, ${marker.ngo.locality}, ${marker.ngo.county}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(marker.ngo.id)}
                  onMouseEnter={(event) => showTooltip(event, marker.ngo.id)}
                  onMouseMove={(event) => showTooltip(event, marker.ngo.id)}
                  onMouseLeave={() => setTooltip(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(marker.ngo.id);
                    }
                  }}
                  className="cursor-pointer outline-none"
                >
                  <title>{marker.ngo.name}</title>
                  <circle cx={marker.x} cy={marker.y} r={7} fill="transparent" />
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={isSelected ? 4 : isHovered ? 3.5 : 2.5}
                    fill={recommendationScoreColor(marker.score)}
                    stroke={isSelected ? "#525252" : "#ffffff"}
                    strokeWidth={isSelected ? 2.2 : 1.1}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}

            {schoolPoint ? (
              <g aria-label={`${school.schoolName}, reperul căutării`} role="img">
                <circle
                  cx={schoolPoint.x}
                  cy={schoolPoint.y}
                  r={6.5}
                  fill="#ffffff"
                  stroke="#9d2e2e"
                  strokeWidth={2.4}
                  vectorEffect="non-scaling-stroke"
                />
                <GraduationCap
                  x={schoolPoint.x - 3.5}
                  y={schoolPoint.y - 3.5}
                  width={7}
                  height={7}
                  color="#9d2e2e"
                  strokeWidth={2.5}
                  vectorEffect="non-scaling-stroke"
                  aria-hidden
                />
              </g>
            ) : null}
          </g>
        </svg>
        <p className="pointer-events-none absolute bottom-3 right-3 hidden rounded-md bg-card/90 px-3 py-2 text-sm font-medium text-sub sm:block">
          {nationalView ? "România" : `Județul ${school.county}`}
        </p>
        {hovered && tooltip ? (
          <div
            className="pointer-events-none absolute z-30 max-w-[220px] rounded-md bg-ink px-3 py-2 text-xs font-semibold leading-snug text-card shadow-lg"
            style={{ left: tooltip.left, top: tooltip.top }}
          >
            {hovered.ngo.name} · {hovered.score}/100
          </div>
        ) : null}
      </div>

      <aside
        className="min-h-52 rounded-md border-2 border-line bg-card p-5 lg:min-h-[420px]"
        aria-live="polite"
        aria-label="Detaliile organizației selectate"
      >
        {selected ? (
          <div>
            <div className="flex items-start gap-3 border-b border-line pb-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-paper text-brand">
                <Building2 size={20} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-sub">
                  Organizație selectată
                </p>
                <h3 className="mt-1 font-display text-xl font-bold leading-tight">
                  {selected.ngo.name}
                </h3>
              </div>
            </div>

            <p className="mt-4 text-sm text-sub">
              {selected.ngo.locality}, {selected.ngo.county}
              {selected.distanceKm !== null ? ` · ${formatKm(selected.distanceKm)}` : ""}
            </p>
            <div className="mt-3">
              <RecommendationScoreBadge score={selected.score} label={selected.label} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <ScorePart label="Domeniu" value={selected.scoreBreakdown.activity} max={50} />
              <ScorePart label="Proximitate" value={selected.scoreBreakdown.proximity} max={30} />
              <ScorePart label="Relevanță" value={selected.scoreBreakdown.relevance} max={20} />
            </div>

            <dl className="mt-5 grid gap-3 text-sm">
              <Detail label="Tip intervenție" value={selected.ngo.interventionType} />
              <Detail label="Categorie" value={selected.ngo.legalCategory} />
              <Detail label="Status" value={selected.ngo.status} />
              <Detail
                label="Număr registru"
                value={selected.ngo.registrationNumber || "Indisponibil"}
              />
            </dl>

            {selected.ngo.relevanceReason ? (
              <div className="mt-5 border-t border-line pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-sub">
                  De ce este potrivită
                </p>
                <p className="mt-2 text-sm leading-relaxed">{selected.ngo.relevanceReason}</p>
              </div>
            ) : null}

            <div className="mt-5 border-t border-line pt-4">
              <NgoContactDialog
                contact={getNgoContact(selected.ngo.id)}
                emailDraft={buildSchoolEmailDraft({
                  email: getNgoContact(selected.ngo.id)?.email ?? getMockNgoEmail(selected.ngo.id),
                  school,
                  county,
                  national,
                })}
                variant="button"
              />
            </div>
          </div>
        ) : (
          <p className="font-semibold">Nicio organizație nu are coordonate disponibile.</p>
        )}
      </aside>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-sub">{label}</dt>
      <dd className="mt-0.5 leading-snug">{value}</dd>
    </div>
  );
}

function ScorePart({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="rounded-md bg-paper px-2 py-2">
      <strong className="block text-sm">
        {value}/{max}
      </strong>
      <span className="mt-0.5 block text-sub">{label}</span>
    </div>
  );
}
