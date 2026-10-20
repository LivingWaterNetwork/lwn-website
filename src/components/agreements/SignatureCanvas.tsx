"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";

export type SignatureCanvasHandle = {
  /** Returns a PNG data URL, or null if nothing has been drawn. */
  toDataUrl: () => string | null;
  clear: () => void;
};

/**
 * A pointer- and touch-driven signature pad. Draws on an HTML canvas and
 * exposes its content as a PNG data URL via an imperative handle, read only
 * when the parent actually submits — not on every stroke.
 */
export const SignatureCanvas = forwardRef<SignatureCanvasHandle, { onChange?: (hasDrawing: boolean) => void; label?: string }>(
  function SignatureCanvas({ onChange, label = "Draw your signature" }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawingRef = useRef(false);
    const hasDrawnRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const [hasDrawing, setHasDrawing] = useState(false);

    const getContext = useCallback(() => canvasRef.current?.getContext("2d") ?? null, []);

    const getPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    }, []);

    useImperativeHandle(ref, () => ({
      toDataUrl: () => (hasDrawnRef.current ? canvasRef.current?.toDataURL("image/png") ?? null : null),
      clear,
    }));

    function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
      e.preventDefault();
      canvasRef.current?.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      lastPointRef.current = getPoint(e);
    }

    function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
      if (!drawingRef.current) return;
      const ctx = getContext();
      const point = getPoint(e);
      if (!ctx || !point || !lastPointRef.current) return;

      ctx.strokeStyle = "#0A2A47";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      lastPointRef.current = point;
      if (!hasDrawnRef.current) {
        hasDrawnRef.current = true;
        setHasDrawing(true);
        onChange?.(true);
      }
    }

    function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
      drawingRef.current = false;
      lastPointRef.current = null;
      canvasRef.current?.releasePointerCapture(e.pointerId);
    }

    function clear() {
      const canvas = canvasRef.current;
      const ctx = getContext();
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasDrawnRef.current = false;
      setHasDrawing(false);
      onChange?.(false);
    }

    return (
      <div>
        <div className="rounded-lg border-2 border-dashed border-mist bg-white touch-none">
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            role="img"
            aria-label={label}
            className="w-full h-[140px] sm:h-[160px] touch-none cursor-crosshair rounded-lg"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-slate">{hasDrawing ? "Signature captured." : "Optional — draw with your mouse or finger."}</p>
          <button
            type="button"
            onClick={clear}
            disabled={!hasDrawing}
            className="text-xs font-medium text-copper hover:text-copper-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear &amp; redo
          </button>
        </div>
      </div>
    );
  }
);
