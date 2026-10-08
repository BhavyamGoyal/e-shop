"use client";

import { useCallback, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { useHydrated } from "@/hooks/useHydrated";
import { useTableLayoutStore } from "@/stores/table-layout/TableLayout.store";
import type { ColumnConfig } from "@/components/organisms/Table/Table.types";

export const DEFAULT_COLUMN_WIDTH = 160;
export const MIN_COLUMN_WIDTH = 64;

export const SELECTION_COLUMN_WIDTH = 40;
export const SERIAL_COLUMN_WIDTH = 48;

export interface LeadingOffsets {
  selection: number;
  serial: number;
  column: number;
}

export function leadingOffsets(hasSelection: boolean, hasSerial: boolean): LeadingOffsets {
  const serial = hasSelection ? SELECTION_COLUMN_WIDTH : 0;
  return {
    selection: 0,
    serial,
    column: serial + (hasSerial ? SERIAL_COLUMN_WIDTH : 0),
  };
}

export interface ColumnLayoutHandlers<TRow> {
  columns: ColumnConfig<TRow>[];
  fixedLayout: boolean;
  widthOf: (column: ColumnConfig<TRow>) => number;
  totalWidth: number;
  onReorder?: (dragKey: string, targetKey: string) => void;
  onResize?: (columnKey: string, width: number) => void;
  isMovable: (column: ColumnConfig<TRow>) => boolean;
  hasCustomLayout: boolean;
  onResetLayout: () => void;
}

interface ColumnLayoutParams<TRow> {
  reorderable: boolean;
  resizable: boolean;
  columns: ColumnConfig<TRow>[];
  urlKey?: string;
  availableWidth: number;
  hasSelection: boolean;
  hasSerial: boolean;
}

function useRoutePattern(): string {
  const pathname: string = usePathname() ?? "";
  const params = useParams() ?? {};

  return useMemo<string>(() => {
    const dynamic = new Map<string, string>();
    for (const [name, value] of Object.entries(params)) {
      for (const part of Array.isArray(value) ? value : [value]) {
        if (part) dynamic.set(part, name);
      }
    }
    return pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => {
        const name = dynamic.get(segment);
        return name ? `:${name}` : segment;
      })
      .join("/");
  }, [pathname, params]);
}

function isFrozen<TRow>(column: ColumnConfig<TRow>): boolean {
  return column.sticky === true;
}

export function useColumnLayout<TRow>(params: ColumnLayoutParams<TRow>): ColumnLayoutHandlers<TRow> {
  const { reorderable, resizable, columns, urlKey, availableWidth, hasSelection, hasSerial } = params;

  const leadingWidth = (hasSelection ? SELECTION_COLUMN_WIDTH : 0) + (hasSerial ? SERIAL_COLUMN_WIDTH : 0);

  const route = useRoutePattern();
  const id = urlKey ? `${route}#${urlKey}` : route;

  const hydrated = useHydrated();
  const stored = useTableLayoutStore((state) => state.layouts[id]);
  const setOrder = useTableLayoutStore((state) => state.setOrder);
  const setWidth = useTableLayoutStore((state) => state.setWidth);
  const resetLayout = useTableLayoutStore((state) => state.reset);

  const active = hydrated ? stored : undefined;

  const ordered = useMemo<ColumnConfig<TRow>[]>(() => {
    const order = active?.order;
    if (!reorderable || !order?.length) return columns;

    const rank = new Map(order.map((key, index) => [key, index]));
    const frozen = columns.filter(isFrozen);
    const movable = columns.filter((column) => !isFrozen(column));

    const sorted = [...movable].sort(
      (a, b) => (rank.get(a.key) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.key) ?? Number.MAX_SAFE_INTEGER),
    );
    return [...frozen, ...sorted];
  }, [columns, active?.order, reorderable]);

  const defaultWidth = useMemo<number>(() => {
    if (!resizable || availableWidth <= 0 || columns.length === 0) {
      return DEFAULT_COLUMN_WIDTH;
    }
    const share = Math.floor((availableWidth - leadingWidth) / columns.length);
    return Math.max(DEFAULT_COLUMN_WIDTH, share);
  }, [resizable, availableWidth, leadingWidth, columns.length]);

  const widthOf = useCallback(
    (column: ColumnConfig<TRow>): number => {
      if (!resizable) return 0;
      return active?.widths[column.key] ?? column.width ?? defaultWidth;
    },
    [resizable, active?.widths, defaultWidth],
  );

  const totalWidth = useMemo<number>(() => {
    if (!resizable) return 0;
    return ordered.reduce((sum, column) => sum + widthOf(column), leadingWidth);
  }, [resizable, ordered, widthOf, leadingWidth]);

  const onReorder = useCallback(
    (dragKey: string, targetKey: string): void => {
      if (dragKey === targetKey) return;
      const keys = ordered.filter((column) => !isFrozen(column)).map((column) => column.key);
      const from = keys.indexOf(dragKey);
      const to = keys.indexOf(targetKey);
      if (from === -1 || to === -1) return;

      keys.splice(from, 1);
      keys.splice(to, 0, dragKey);
      setOrder(id, keys);
    },
    [id, ordered, setOrder],
  );

  const onResize = useCallback(
    (columnKey: string, width: number): void => {
      setWidth(id, columnKey, Math.max(MIN_COLUMN_WIDTH, Math.round(width)));
    },
    [id, setWidth],
  );

  const hasCustomLayout: boolean = Boolean(active && (active.order.length > 0 || Object.keys(active.widths).length > 0));

  const onResetLayout = useCallback((): void => resetLayout(id), [id, resetLayout]);

  const isMovable = useCallback((column: ColumnConfig<TRow>): boolean => reorderable && !isFrozen(column), [reorderable]);

  return {
    columns: ordered,
    fixedLayout: resizable,
    widthOf,
    totalWidth,
    onReorder: reorderable ? onReorder : undefined,
    onResize: resizable ? onResize : undefined,
    isMovable,
    hasCustomLayout,
    onResetLayout,
  };
}
