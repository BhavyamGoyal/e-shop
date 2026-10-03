import type { ColumnConfig, TableSelection } from "@/components/organisms/Table/Table.types";

export interface TableBodyProps<TRow> {
  columns: ColumnConfig<TRow>[];
  rows: TRow[];
  rowKey: keyof TRow | ((row: TRow) => string | number);
  onRowClick?: (row: TRow) => void;
  showSerialNumber?: boolean;
  serialOffset?: number;
  selection?: TableSelection<TRow>;
  fixedLayout?: boolean;

  draggingKey?: string | null;
  overKey?: string | null;
}
