"use client";

import type { TableHeaderProps } from "@/components/molecules/Table/TableHeader.types";
import { leadingOffsets } from "@/components/organisms/Table/ColumnLayout.controller";
import { HeaderCell } from "@/components/molecules/Table/HeaderCell";
import { Checkbox } from "@/components/atoms/Controls/Checkbox";

const STICKY_HEADER_CLASS = "sticky z-30";
const LEADING_CELL_CLASS =
  "sticky top-0 z-30 bg-surface border-b border-border px-3.5 py-2 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap text-muted-foreground";

export function TableHeader<TRow>({
  columns,
  sort,
  onSortChange,
  showFilters = false,
  filters,
  onFilterChange,
  filterPlaceholder,
  showSerialNumber = true,
  selection,
  drag,
  onResize,
  widthOf,
  isMovable,
}: TableHeaderProps<TRow>) {
  const filtersEnabled: boolean = showFilters && !!onFilterChange;

  const offsets = leadingOffsets(Boolean(selection), showSerialNumber);

  return (
    <thead>
      <tr>
        {selection && (
          <th className={`${LEADING_CELL_CLASS} w-10`} style={{ left: offsets.selection }}>
            <Checkbox checked={selection.allSelected} indeterminate={!selection.allSelected && selection.someSelected} onChange={selection.onToggleAll} label={selection.selectAllLabel} />
          </th>
        )}
        {showSerialNumber && (
          <th className={`${LEADING_CELL_CLASS} w-12`} style={{ left: offsets.serial }}>
            #
          </th>
        )}
        {columns.map((col) => {
          const direction = sort?.columnKey === col.key ? sort.direction : null;
          const className = [col.sticky ? STICKY_HEADER_CLASS : "", col.headerClassName ?? ""].filter(Boolean).join(" ");
          return (
            <HeaderCell
              key={col.key}
              columnKey={col.key}
              label={col.header}
              tooltip={col.headerTooltip}
              sortable={col.sortable}
              direction={direction}
              align={col.align ?? "left"}
              className={className}
              onToggle={onSortChange}
              filterable={filtersEnabled && col.filterable}
              filterText={filters?.[col.key] ?? ""}
              onFilterChange={onFilterChange}
              filterPlaceholder={filterPlaceholder}
              filterOptions={col.filterOptions}
              filterAllLabel={col.filterAllLabel}
              movable={isMovable?.(col) ?? false}
              gripHandlers={drag.gripHandlers(col.key)}
              dragging={drag.draggingKey === col.key}
              dropTarget={drag.overKey === col.key}
              width={widthOf ? widthOf(col) : undefined}
              onResize={onResize}
              style={col.sticky ? { left: offsets.column } : undefined}
            />
          );
        })}
        {widthOf && <th aria-hidden className="sticky top-0 z-20 border-b border-border bg-surface" />}
      </tr>
    </thead>
  );
}
