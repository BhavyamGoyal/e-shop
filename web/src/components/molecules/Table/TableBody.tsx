import type { TableBodyProps } from "@/components/molecules/Table/TableBody.types";
import { Checkbox } from "@/components/atoms/Controls/Checkbox";
import { leadingOffsets } from "@/components/organisms/Table/ColumnLayout.controller";

const ALIGN_CLASS = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

const STICKY_CELL_CLASS = "sticky z-10 bg-surface";
const CLIPPED_CELL_CLASS = "overflow-hidden text-ellipsis";
const DRAGGING_CELL_CLASS = "opacity-40";
const DROP_TARGET_CELL_CLASS = "bg-primary/15";

function resolveKey<TRow>(row: TRow, rowKey: TableBodyProps<TRow>["rowKey"]): string | number {
  if (typeof rowKey === "function") return rowKey(row);
  return row[rowKey] as unknown as string | number;
}

export function TableBody<TRow>({
  columns,
  rows,
  rowKey,
  onRowClick,
  showSerialNumber = true,
  serialOffset = 0,
  selection,
  fixedLayout = false,
  draggingKey = null,
  overKey = null,
}: TableBodyProps<TRow>) {
  const offsets = leadingOffsets(Boolean(selection), showSerialNumber);

  if (rows.length === 0) return <tbody />;

  return (
    <tbody>
      {rows.map((row, index) => {
        const key = resolveKey(row, rowKey);
        return (
          <tr key={key} onClick={onRowClick ? () => onRowClick(row) : undefined} className={`transition-colors hover:bg-muted ${onRowClick ? "cursor-pointer" : ""}`}>
            {selection && (
              <td className={`border-b border-border px-3.5 py-2.5 w-10 ${STICKY_CELL_CLASS}`} style={{ left: offsets.selection }} onClick={(event) => event.stopPropagation()}>
                <Checkbox checked={selection.isSelected(row)} onChange={() => selection.onToggleRow(row)} label={selection.selectRowLabel} />
              </td>
            )}
            {showSerialNumber && (
              <td className={`border-b border-border px-3.5 py-2.5 text-sm text-muted-foreground w-12 ${STICKY_CELL_CLASS}`} style={{ left: offsets.serial }}>
                {serialOffset + index + 1}
              </td>
            )}
            {columns.map((col) => {
              const dragClass = col.key === draggingKey ? DRAGGING_CELL_CLASS : col.key === overKey ? DROP_TARGET_CELL_CLASS : "";
              return (
                <td
                  key={col.key}
                  style={col.sticky ? { left: offsets.column } : undefined}
                  className={`border-b border-border px-3.5 py-2.5 text-sm text-foreground whitespace-nowrap ${ALIGN_CLASS[col.align ?? "left"]} ${col.sticky ? STICKY_CELL_CLASS : ""} ${fixedLayout ? CLIPPED_CELL_CLASS : ""} ${dragClass} ${col.cellClassName ?? ""}`}
                >
                  {col.render(row)}
                </td>
              );
            })}
            {fixedLayout && <td aria-hidden className="border-b border-border" />}
          </tr>
        );
      })}
    </tbody>
  );
}
