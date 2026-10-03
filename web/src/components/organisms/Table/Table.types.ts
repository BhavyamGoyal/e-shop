import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export interface SortState {
  columnKey: string;
  direction: SortDirection;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalRows: number;
}

export interface ColumnFilterOption {
  value: string;
  label: string;
}

export interface ColumnConfig<TRow> {
  key: string;
  header: string;
  headerTooltip?: string;
  sortable?: boolean;
  filterable?: boolean;
  filterValue?: (row: TRow) => string;
  filterOptions?: ColumnFilterOption[];
  filterAllLabel?: string;
  align?: "left" | "right" | "center";
  width?: number;
  sticky?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: TRow) => ReactNode;
}

export interface TableSelection<TRow> {
  isSelected: (row: TRow) => boolean;
  onToggleRow: (row: TRow) => void;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  selectAllLabel: string;
  selectRowLabel: string;
}

export interface TableProps<TRow> {
  columns: ColumnConfig<TRow>[];
  sort: SortState | null;
  onSortChange: (next: SortState | null) => void;

  showFilters?: boolean;
  filters?: Record<string, string>;
  onFilterChange?: (columnKey: string, value: string) => void;
  filterPlaceholder?: string;

  rows: TRow[];
  rowKey: keyof TRow | ((row: TRow) => string | number);
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  loadingMessage?: string;
  onRowClick?: (row: TRow) => void;

  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  paginationLabels?: TablePaginationLabels;

  caption?: string;
  toolbar?: ReactNode;
  filterBar?: ReactNode;

  exportOptions?: {
    filename?: string;
  };
  showSerialNumber?: boolean;

  selection?: TableSelection<TRow>;

  reorderableColumns?: boolean;
  resizableColumns?: boolean;

  urlKey?: string;
  urlState?: boolean;
}

export interface TablePaginationLabels {
  showing?: (start: number, end: number, total: number) => string;
  prev?: string;
  next?: string;
  goToPage?: (page: number) => string;
  rowsPerPage?: string;
  resetLayout?: string;
}
