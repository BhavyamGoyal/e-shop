import type { CSSProperties } from "react";
import type { ColumnFilterOption, SortDirection, SortState } from "@/components/organisms/Table/Table.types";
import type { ColumnGripHandlers } from "@/components/organisms/Table/ColumnDrag.controller";

export interface HeaderCellProps {
  columnKey: string;
  label: string;
  tooltip?: string;
  sortable?: boolean;
  direction?: SortDirection | null;
  align?: "left" | "right" | "center";
  className?: string;
  style?: CSSProperties;
  onToggle?: (next: SortState | null) => void;

  filterable?: boolean;
  filterText?: string;
  onFilterChange?: (columnKey: string, value: string) => void;
  filterPlaceholder?: string;
  filterOptions?: ColumnFilterOption[];
  filterAllLabel?: string;

  movable?: boolean;
  gripHandlers?: ColumnGripHandlers;
  dragging?: boolean;
  dropTarget?: boolean;

  width?: number;
  onResize?: (columnKey: string, width: number) => void;
  resizeLabel?: string;
}
