import type { PageWindowItem } from "@/components/molecules/Table/TablePagination.types";
import type { PaginationState } from "@/components/organisms/Table/Table.types";

const DEFAULT_SIBLINGS = 1;
const BOUNDARY_COUNT = 1;

export function buildPageWindow(current: number, total: number, siblings: number = DEFAULT_SIBLINGS): PageWindowItem[] {
  if (total <= 0) return [];
  const totalPageButtons = siblings * 2 + 3 + BOUNDARY_COUNT * 2;
  if (total <= totalPageButtons) return range(1, total);

  const leftSiblingStart = Math.max(current - siblings, BOUNDARY_COUNT + 2);
  const rightSiblingEnd = Math.min(current + siblings, total - BOUNDARY_COUNT - 1);

  const showLeftEllipsis = leftSiblingStart > BOUNDARY_COUNT + 2;
  const showRightEllipsis = rightSiblingEnd < total - BOUNDARY_COUNT - 1;

  const items: PageWindowItem[] = [1];
  if (showLeftEllipsis) {
    items.push("ellipsis-left");
  } else {
    for (let p = 2; p < leftSiblingStart; p++) items.push(p);
  }
  for (let p = leftSiblingStart; p <= rightSiblingEnd; p++) items.push(p);
  if (showRightEllipsis) {
    items.push("ellipsis-right");
  } else {
    for (let p = rightSiblingEnd + 1; p < total; p++) items.push(p);
  }
  items.push(total);
  return items;
}

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

export interface TablePaginationView {
  rangeLabel: string;
  items: PageWindowItem[];
  canPrev: boolean;
  canNext: boolean;
  totalPages: number;
}

export function computePaginationView(
  pagination: PaginationState,
  formatRange: (start: number, end: number, total: number) => string,
): TablePaginationView {
  const { page, pageSize, totalRows } = pagination;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const start = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalRows);
  return {
    rangeLabel: formatRange(start, end, totalRows),
    items: buildPageWindow(page, totalPages),
    canPrev: page > 1,
    canNext: page < totalPages,
    totalPages,
  };
}
