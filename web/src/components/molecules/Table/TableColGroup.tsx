import type { ColumnConfig } from "@/components/organisms/Table/Table.types";
import { SELECTION_COLUMN_WIDTH, SERIAL_COLUMN_WIDTH } from "@/components/organisms/Table/ColumnLayout.controller";

interface TableColGroupProps<TRow> {
  columns: ColumnConfig<TRow>[];
  widthOf: (column: ColumnConfig<TRow>) => number;
  hasSelection: boolean;
  hasSerial: boolean;
}

export function TableColGroup<TRow>({ columns, widthOf, hasSelection, hasSerial }: TableColGroupProps<TRow>) {
  return (
    <colgroup>
      {hasSelection && <col style={{ width: SELECTION_COLUMN_WIDTH }} />}
      {hasSerial && <col style={{ width: SERIAL_COLUMN_WIDTH }} />}
      {columns.map((column) => (
        <col key={column.key} style={{ width: widthOf(column) }} />
      ))}
      <col />
    </colgroup>
  );
}
