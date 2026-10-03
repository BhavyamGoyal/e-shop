"use client";

import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const DRAG_THRESHOLD_PX = 4;

export interface ColumnGripHandlers {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
}

export interface ColumnDragHandlers {
  draggingKey: string | null;
  overKey: string | null;
  gripHandlers: (columnKey: string) => ColumnGripHandlers;
}

interface DragState {
  columnKey: string;
  originX: number;
  originY: number;
  started: boolean;
}

function columnKeyAt(x: number, y: number): string | null {
  const element = document.elementFromPoint(x, y);
  const cell = element?.closest<HTMLElement>("th[data-column-key]");
  return cell?.dataset.columnKey ?? null;
}

export function useColumnDrag(
  onReorder: ((dragKey: string, targetKey: string) => void) | undefined,
  droppableKeys: ReadonlySet<string>,
): ColumnDragHandlers {
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const drag = useRef<DragState | null>(null);

  const finish = useCallback((): void => {
    drag.current = null;
    setDraggingKey(null);
    setOverKey(null);
  }, []);

  const gripHandlers = useCallback(
    (columnKey: string): ColumnGripHandlers => ({
      onPointerDown: (event) => {
        if (!onReorder) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          columnKey,
          originX: event.clientX,
          originY: event.clientY,
          started: false,
        };
      },

      onPointerMove: (event) => {
        const state = drag.current;
        if (!state) return;

        if (!state.started) {
          const moved = Math.abs(event.clientX - state.originX) + Math.abs(event.clientY - state.originY);
          if (moved < DRAG_THRESHOLD_PX) return;
          state.started = true;
          setDraggingKey(state.columnKey);
        }

        const target = columnKeyAt(event.clientX, event.clientY);
        setOverKey(target && target !== state.columnKey && droppableKeys.has(target) ? target : null);
      },

      onPointerUp: (event) => {
        const state = drag.current;
        if (!state) return;
        if (state.started) {
          const target = columnKeyAt(event.clientX, event.clientY);
          if (target && target !== state.columnKey && droppableKeys.has(target)) {
            onReorder?.(state.columnKey, target);
          }
        }
        finish();
      },

      onPointerCancel: finish,
    }),
    [onReorder, droppableKeys, finish],
  );

  return { draggingKey, overKey, gripHandlers };
}
