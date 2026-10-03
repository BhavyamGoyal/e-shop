import type { ReactNode } from "react";
import type { PaginationState, TablePaginationLabels } from "@/components/organisms/Table/Table.types";

export type PageWindowItem = number | "ellipsis-left" | "ellipsis-right";

export const PAGE_SIZE_OPTIONS: ReadonlyArray<number> = [10, 20, 50, 100, 200, 500, 1000];

export interface TablePaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  labels?: TablePaginationLabels;
  leading?: ReactNode;
}
