import { useRef, useState, type PointerEvent } from "react";

type Viewport = {
  scale: number;
  x: number;
  y: number;
};

type PanStart = Viewport & {
  clientX: number;
  clientY: number;
};

export function useSvgPanZoom({
  width,
  height,
  centerX,
  centerY,
  maxScale = 3,
}: {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  maxScale?: number;
}) {
  const [viewport, setViewport] = useState<Viewport>({ scale: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const panStart = useRef<PanStart | null>(null);
  const moved = useRef(false);

  function clampPan(value: number, size: number, scale: number) {
    const limit = (size * (scale - 1)) / 2;
    return Math.max(-limit, Math.min(limit, value));
  }

  function setScale(nextScale: number) {
    setViewport((current) => {
      const scale = Math.max(1, Math.min(maxScale, nextScale));
      return {
        scale,
        x: clampPan(current.x, width, scale),
        y: clampPan(current.y, height, scale),
      };
    });
  }

  function zoomIn() {
    setScale(viewport.scale + 0.35);
  }

  function zoomOut() {
    setScale(viewport.scale - 0.35);
  }

  function reset() {
    setViewport({ scale: 1, x: 0, y: 0 });
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (viewport.scale <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    panStart.current = { ...viewport, clientX: event.clientX, clientY: event.clientY };
    moved.current = false;
    setDragging(true);
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!panStart.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const deltaX = (event.clientX - panStart.current.clientX) * (width / rect.width);
    const deltaY = (event.clientY - panStart.current.clientY) * (height / rect.height);
    if (Math.abs(deltaX) + Math.abs(deltaY) > 3) moved.current = true;
    setViewport((current) => ({
      ...current,
      x: clampPan(panStart.current!.x + deltaX, width, current.scale),
      y: clampPan(panStart.current!.y + deltaY, height, current.scale),
    }));
  }

  function endPan(event: PointerEvent<SVGSVGElement>) {
    if (panStart.current && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    panStart.current = null;
    setDragging(false);
  }

  function onClickCapture(event: PointerEvent<SVGSVGElement>) {
    if (!moved.current) return;
    event.preventDefault();
    event.stopPropagation();
    moved.current = false;
  }

  return {
    scale: viewport.scale,
    transform: `translate(${viewport.x} ${viewport.y}) translate(${centerX} ${centerY}) scale(${viewport.scale}) translate(${-centerX} ${-centerY})`,
    zoomIn,
    zoomOut,
    reset,
    interactionProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPan,
      onPointerCancel: endPan,
      onClickCapture,
      style: {
        touchAction: viewport.scale > 1 ? "none" : "pan-y",
        cursor: viewport.scale > 1 ? (dragging ? "grabbing" : "grab") : "default",
      },
    },
  };
}
