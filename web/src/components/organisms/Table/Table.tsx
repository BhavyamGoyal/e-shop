"use client";

import { useMemo, useRef, useState } from "react";
import { Loader } from "@/components/atoms/Feedback/Loader";
import { EmptyState } from "@/components/molecules/States/EmptyState";
import { ErrorState } from "@/components/molecules/States/ErrorState";
import { Select } from "@/components/atoms/Controls/Select";
import type { TableProps } from "@/components/organisms/Table/Table.types";
import { useTableUrlState } from "@/components/organisms/Table/Table.controller";
import { TableHeader } from "@/components/molecules/Table/TableHeader";
import { TableBody } from "@/components/molecules/Table/TableBody";
import { TableColGroup } from "@/components/molecules/Table/TableColGroup";
import { useColumnLayout } from "@/components/organisms/Table/ColumnLayout.controller";
import { useColumnDrag } from "@/components/organisms/Table/ColumnDrag.controller";
import { useElementWidth } from "@/hooks/useElementWidth";
import { TablePagination } from "@/components/molecules/Table/TablePagination";
import { exportToCsv, exportToExcel } from "@/lib/export.service";
import { RefreshIcon } from "@/components/atoms/Icons";

const EXPORT_OPTIONS = [
  { value: "csv", label: "CSV" },
  { value: "excel", label: "Excel" },
];

export function Table<TRow>(props: TableProps<TRow>) {
  const {
    columns,
    sort,
    onSortChange,
    rows,
    rowKey,
    loading = false,
    error = null,
    emptyMessage,
    loadingMessage,
    onRowClick,
    pagination,
    onPageChange,
    onPageSizeChange,
    paginationLabels,
    caption,
    toolbar,
    showFilters,
    filters,
    onFilterChange,
    filterPlaceholder,
    exportOptions,
    showSerialNumber = true,
    filterBar,
    selection,
    urlKey,
    urlState = true,
    reorderableColumns = true,
    resizableColumns = true,
  } = props;

  const scrollRef = useRef<HTMLDivElement>(null);
  const availableWidth = useElementWidth(scrollRef);

  const layout = useColumnLayout<TRow>({
    reorderable: reorderableColumns,
    resizable: resizableColumns,
    columns,
    urlKey,
    availableWidth,
    hasSelection: Boolean(selection),
    hasSerial: Boolean(showSerialNumber),
  });

  const url = useTableUrlState<TRow>({
    enabled: urlState,
    urlKey,
    columns,
    filtersEnabled: Boolean(showFilters && onFilterChange),
    sort,
    onSortChange,
    filters,
    onFilterChange,
    pageSize: pagination.pageSize,
    onPageSizeChange,
    page: pagination.page,
    onPageChange,
  });

  const droppableKeys = useMemo<ReadonlySet<string>>(
    () => new Set(layout.columns.filter(layout.isMovable).map((column) => column.key)),
    [layout.columns, layout.isMovable],
  );
  const drag = useColumnDrag(layout.onReorder, droppableKeys);

  const regionLabel = caption ?? "Data table";
  const filename = exportOptions?.filename ?? "export";
  const [exportFormat, setExportFormat] = useState<string>("");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      {toolbar}
      {(filterBar || exportOptions) && (
        <div className="flex flex-wrap items-end gap-3 border-b border-border px-4 py-2">
          {filterBar && <div className="min-w-0 flex-1">{filterBar}</div>}
          {exportOptions && (
            <div className="ml-auto w-40 shrink-0">
              <Select
                placeholder="Export as…"
                value={exportFormat}
                options={EXPORT_OPTIONS}
                onChange={(event) => {
                  const format = event.target.value;
                  if (format === "csv") exportToCsv(rows, layout.columns, filename);
                  if (format === "excel") void exportToExcel(rows, layout.columns, filename);
                  setExportFormat("");
                }}
              />
            </div>
          )}
        </div>
      )}
      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} role="region" aria-label={regionLabel} tabIndex={0} className="h-full overflow-auto">
          <table
            className={`border-collapse ${layout.fixedLayout ? "table-fixed" : "w-full"}`}
            style={layout.fixedLayout ? { width: layout.totalWidth, minWidth: "100%" } : undefined}
            aria-busy={loading || undefined}
          >
            {caption && <caption className="sr-only">{caption}</caption>}
            {layout.fixedLayout && (
              <TableColGroup<TRow> columns={layout.columns} widthOf={layout.widthOf} hasSelection={Boolean(selection)} hasSerial={Boolean(showSerialNumber)} />
            )}
            <TableHeader<TRow>
              columns={layout.columns}
              sort={sort}
              onSortChange={url.onSortChange}
              showFilters={showFilters}
              filters={filters}
              onFilterChange={url.onFilterChange}
              filterPlaceholder={filterPlaceholder}
              showSerialNumber={showSerialNumber}
              selection={selection}
              drag={drag}
              onResize={layout.onResize}
              widthOf={layout.fixedLayout ? layout.widthOf : undefined}
              isMovable={layout.isMovable}
            />
            <TableBody<TRow>
              columns={layout.columns}
              rows={rows}
              rowKey={rowKey}
              onRowClick={onRowClick}
              showSerialNumber={showSerialNumber}
              serialOffset={(pagination.page - 1) * pagination.pageSize}
              selection={selection}
              fixedLayout={layout.fixedLayout}
              draggingKey={drag.draggingKey}
              overKey={drag.overKey}
            />
          </table>
        </div>
        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface/60 backdrop-blur-[1px]">
            <Loader size="lg" label={loadingMessage} />
          </div>
        )}
        {!loading && error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <ErrorState message={error} />
          </div>
        )}
        {!loading && !error && rows.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <EmptyState message={emptyMessage} />
          </div>
        )}
      </div>
      <TablePagination
        pagination={pagination}
        onPageChange={url.onPageChange}
        onPageSizeChange={url.onPageSizeChange}
        labels={paginationLabels}
        leading={
          layout.hasCustomLayout ? (
            <button type="button" onClick={layout.onResetLayout} className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              <RefreshIcon width={12} height={12} aria-hidden />
              {paginationLabels?.resetLayout ?? "Reset columns"}
            </button>
          ) : null
        }
      />
    </div>
  );
}
