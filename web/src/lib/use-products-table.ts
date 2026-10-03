"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaginationState, SortState } from "@/components/organisms/Table/Table.types";
import { deleteProductAction } from "@/server/actions/product.actions";
import type { ProductListRow } from "@/server/types/admin.types";
import { fetchProducts } from "./admin-api";

export interface ProductsTableController {
  rows: ProductListRow[];
  sort: SortState | null;
  setSort: (next: SortState | null) => void;
  filters: Record<string, string>;
  setFilter: (columnKey: string, value: string) => void;
  pagination: PaginationState;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  isLoading: boolean;
  error: string | null;
  isDeleting: boolean;
  remove: (row: ProductListRow) => Promise<void>;
}

const DEFAULT_PAGE_SIZE = 20;

export function useProductsTable(): ProductsTableController {
  const [rows, setRows] = useState<ProductListRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [sort, setSortState] = useState<SortState | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(DEFAULT_PAGE_SIZE);
  const [loaded, setLoaded] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const sortParam: string | null = sort ? `${sort.columnKey}:${sort.direction}` : null;
  const key: string = JSON.stringify([page, pageSize, sortParam, filters, version]);

  useEffect(() => {
    let active = true;
    fetchProducts({ page, limit: pageSize, sort: sortParam, filters })
      .then((result): void => {
        if (!active) return;
        setRows(result.data);
        setTotal(result.meta.total);
        setError(null);
      })
      .catch((reason: unknown): void => {
        if (active) setError(reason instanceof Error ? reason.message : "Request failed");
      })
      .finally((): void => {
        if (active) setLoaded(key);
      });
    return (): void => {
      active = false;
    };
  }, [page, pageSize, sortParam, filters, key]);

  const setSort = useCallback((next: SortState | null): void => {
    setPage(1);
    setSortState(next);
  }, []);

  const setFilter = useCallback((columnKey: string, value: string): void => {
    setPage(1);
    setFilters((current: Record<string, string>): Record<string, string> => ({ ...current, [columnKey]: value }));
  }, []);

  const setPageSize = useCallback((size: number): void => {
    setPage(1);
    setPageSizeState(size);
  }, []);

  const remove = useCallback(async (row: ProductListRow): Promise<void> => {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    const result = await deleteProductAction(row.id);
    setIsDeleting(false);
    if (result.ok) setVersion((value: number): number => value + 1);
    else setError(result.error ?? "Delete failed");
  }, []);

  return {
    rows,
    sort,
    setSort,
    filters,
    setFilter,
    pagination: { page, pageSize, totalRows: total },
    setPage,
    setPageSize,
    isLoading: loaded !== key,
    error,
    isDeleting,
    remove,
  };
}
