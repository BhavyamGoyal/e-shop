"use client";

import { GripVerticalIcon } from "@/components/atoms/Icons";
import type { ColumnDragGripProps } from "@/components/atoms/Table/ColumnDragGrip.types";

export function ColumnDragGrip({ label, ...handlers }: ColumnDragGripProps) {
  return (
    <span
      role="button"
      aria-label={`Move ${label}`}
      {...handlers}
      className="-ml-1 shrink-0 cursor-grab touch-none opacity-0 transition-opacity active:cursor-grabbing group-hover/th:opacity-50 hover:!opacity-100 pointer-coarse:opacity-50"
    >
      <GripVerticalIcon width={12} height={12} aria-hidden />
    </span>
  );
}
