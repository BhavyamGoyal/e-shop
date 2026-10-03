"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { ColumnResizeHandleProps } from "@/components/atoms/Table/ColumnResizeHandle.types";

const KEYBOARD_STEP = 16;

export function ColumnResizeHandle({ label, width, min, onResize }: ColumnResizeHandleProps) {
  const start = useRef<{ x: number; width: number } | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    start.current = { x: event.clientX, width };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!start.current) return;
    const next = start.current.width + (event.clientX - start.current.x);
    onResize(Math.max(min, next));
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    start.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") onResize(Math.max(min, width - KEYBOARD_STEP));
        else if (event.key === "ArrowRight") onResize(width + KEYBOARD_STEP);
        else return;
        event.preventDefault();
      }}
      onClick={(event) => event.stopPropagation()}
      className="absolute -right-1 top-0 z-10 h-full w-2 cursor-col-resize touch-none select-none after:absolute after:left-1/2 after:top-1/2 after:h-1/2 after:w-px after:-translate-x-1/2 after:-translate-y-1/2 after:bg-border after:transition-colors hover:after:h-full hover:after:w-0.5 hover:after:bg-primary focus-visible:after:h-full focus-visible:after:w-0.5 focus-visible:after:bg-primary focus:outline-none"
    />
  );
}
