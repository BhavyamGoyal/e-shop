import type { ColumnDragHandlers } from "@/components/organisms/Table/ColumnDrag.controller";
import type { ColumnConfig, SortState, TableSelection } from "@/components/organisms/Table/Table.types";

export interface TableHeaderProps<TRow> {
  columns: ColumnConfig<TRow>[];
  sort: SortState | null;
  onSortChange: (next: SortState | null) => void;

  showFilters?: boolean;
  filters?: Record<string, string>;
  onFilterChange?: (columnKey: string, value: string) => void;
  filterPlaceholder?: string;

  showSerialNumber?: boolean;
  selection?: TableSelection<TRow>;

  drag: ColumnDragHandlers;
  onResize?: (columnKey: string, width: number) => void;
  widthOf?: (column: ColumnConfig<TRow>) => number;
  isMovable?: (column: ColumnConfig<TRow>) => boolean;
}
