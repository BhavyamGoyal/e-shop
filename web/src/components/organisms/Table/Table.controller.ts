"use client";

import { useCallback, useEffect, useRef } from "react";
import { PAGE_SIZE_OPTIONS } from "@/components/molecules/Table/TablePagination.types";
import type { ColumnConfig, SortState } from "@/components/organisms/Table/Table.types";

const SORT_NONE = "none";

interface TableUrlSnapshot {
  sort: SortState | null;
  filters: Record<string, string>;
  pageSize: number;
  page: number;
}

export interface TableUrlStateOptions<TRow> {
  enabled: boolean;
  urlKey?: string;
  columns: ColumnConfig<TRow>[];
  filtersEnabled: boolean;
  sort: SortState | null;
  onSortChange: (next: SortState | null) => void;
  filters?: Record<string, string>;
  onFilterChange?: (columnKey: string, value: string) => void;
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
  page: number;
  onPageChange: (page: number) => void;
}

export interface TableUrlStateHandlers {
  onSortChange: (next: SortState | null) => void;
  onFilterChange?: (columnKey: string, value: string) => void;
  onPageSizeChange?: (size: number) => void;
  onPageChange: (page: number) => void;
}

function sameSort(a: SortState | null, b: SortState | null): boolean {
  if (!a || !b) return a === b;
  return a.columnKey === b.columnKey && a.direction === b.direction;
}

function serializeSort(sort: SortState | null): string {
  return sort ? `${sort.columnKey}:${sort.direction}` : SORT_NONE;
}

function parseSort<TRow>(raw: string, columns: ColumnConfig<TRow>[]): SortState | null | undefined {
  if (raw === SORT_NONE) return null;
  const split = raw.lastIndexOf(":");
  if (split <= 0) return undefined;
  const columnKey = raw.slice(0, split);
  const direction = raw.slice(split + 1);
  if (direction !== "asc" && direction !== "desc") return undefined;
  if (!columns.find((col) => col.key === columnKey)?.sortable) return undefined;
  return { columnKey, direction };
}

export function useTableUrlState<TRow>(options: TableUrlStateOptions<TRow>): TableUrlStateHandlers {
  const { enabled, urlKey, columns, filtersEnabled, sort, onSortChange, filters, onFilterChange, pageSize, onPageSizeChange, page, onPageChange } =
    options;

  const prefix = urlKey ? `${urlKey}.` : "";
  const sortParam = `${prefix}sort`;
  const sizeParam = `${prefix}size`;
  const pageParam = `${prefix}page`;
  const filterPrefix = `${prefix}f.`;

  const latest = useRef<TableUrlSnapshot>({ sort, filters: filters ?? {}, pageSize, page });
  useEffect(() => {
    latest.current = { sort, filters: filters ?? {}, pageSize, page };
  });

  const commit = useCallback(
    (next: TableUrlSnapshot): void => {
      const params = new URLSearchParams(window.location.search);

      for (const key of [...params.keys()]) {
        if (key === sortParam || key === sizeParam || key === pageParam || key.startsWith(filterPrefix)) {
          params.delete(key);
        }
      }
      params.set(sortParam, serializeSort(next.sort));
      if (filtersEnabled) {
        for (const [columnKey, value] of Object.entries(next.filters)) {
          if (value.trim()) params.set(`${filterPrefix}${columnKey}`, value);
        }
      }
      params.set(sizeParam, String(next.pageSize));
      params.set(pageParam, String(next.page));

      const query = params.toString();
      const search = query ? `?${query}` : "";
      window.history.replaceState(null, "", `${window.location.pathname}${search}${window.location.hash}`);
    },
    [sortParam, sizeParam, pageParam, filterPrefix, filtersEnabled],
  );

  const hasRestored = useRef(false);
  useEffect(() => {
    if (!enabled || hasRestored.current || columns.length === 0) return;
    hasRestored.current = true;
    const params = new URLSearchParams(window.location.search);

    const rawSize = params.get(sizeParam);
    if (rawSize && onPageSizeChange) {
      const size = Number(rawSize);
      if (PAGE_SIZE_OPTIONS.includes(size) && size !== latest.current.pageSize) {
        onPageSizeChange(size);
      }
    }

    if (filtersEnabled && onFilterChange) {
      for (const [key, value] of params.entries()) {
        if (!key.startsWith(filterPrefix) || !value.trim()) continue;
        const columnKey = key.slice(filterPrefix.length);
        if (!columns.find((col) => col.key === columnKey)?.filterable) continue;
        if ((latest.current.filters[columnKey] ?? "") !== value) {
          onFilterChange(columnKey, value);
        }
      }
    }

    const rawSort = params.get(sortParam);
    if (rawSort) {
      const restored = parseSort(rawSort, columns);
      if (restored !== undefined && !sameSort(restored, latest.current.sort)) {
        onSortChange(restored);
      }
    }

    const rawPage = params.get(pageParam);
    if (rawPage) {
      const restoredPage = Number(rawPage);
      if (Number.isInteger(restoredPage) && restoredPage >= 1 && restoredPage !== latest.current.page) {
        onPageChange(restoredPage);
      }
    }
  }, [enabled, columns]);

  const handleSortChange = useCallback(
    (next: SortState | null): void => {
      onSortChange(next);
      if (enabled) commit({ ...latest.current, sort: next, page: 1 });
    },
    [enabled, onSortChange, commit],
  );

  const handleFilterChange = useCallback(
    (columnKey: string, value: string): void => {
      onFilterChange?.(columnKey, value);
      if (enabled) {
        const merged = { ...latest.current.filters, [columnKey]: value };
        commit({ ...latest.current, filters: merged, page: 1 });
      }
    },
    [enabled, onFilterChange, commit],
  );

  const handlePageSizeChange = useCallback(
    (size: number): void => {
      onPageSizeChange?.(size);
      if (enabled) commit({ ...latest.current, pageSize: size, page: 1 });
    },
    [enabled, onPageSizeChange, commit],
  );

  const handlePageChange = useCallback(
    (next: number): void => {
      onPageChange(next);
      if (enabled) commit({ ...latest.current, page: next });
    },
    [enabled, onPageChange, commit],
  );

  return {
    onSortChange: handleSortChange,
    onFilterChange: onFilterChange ? handleFilterChange : undefined,
    onPageSizeChange: onPageSizeChange ? handlePageSizeChange : undefined,
    onPageChange: handlePageChange,
  };
}
