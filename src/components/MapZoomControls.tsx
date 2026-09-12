import { Minus, Plus, RotateCcw } from "lucide-react";

export function MapZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div
      className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-md bg-card p-1.5 shadow-lg ring-1 ring-ink/10"
      aria-label="Comenzi zoom hartă"
    >
      <button
        type="button"
        onClick={onZoomOut}
        disabled={scale <= 1}
        className="grid size-12 place-items-center rounded-md text-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Micșorează harta"
      >
        <Minus size={20} aria-hidden />
      </button>
      <span className="min-w-12 text-center font-mono text-[11px] text-sub" aria-live="polite">
        {Math.round(scale * 100)}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        disabled={scale >= 3}
        className="grid size-12 place-items-center rounded-md text-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Mărește harta"
      >
        <Plus size={20} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={scale === 1}
        className="grid size-12 place-items-center rounded-md text-brand hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Resetează harta"
      >
        <RotateCcw size={18} aria-hidden />
      </button>
    </div>
  );
}
