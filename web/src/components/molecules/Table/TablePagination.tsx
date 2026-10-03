import { PAGE_SIZE_OPTIONS, type TablePaginationProps } from "@/components/molecules/Table/TablePagination.types";
import { computePaginationView } from "@/components/molecules/Table/TablePagination.controller";
import { PageButton } from "@/components/molecules/Table/PageButton";

const DEFAULT_FORMAT_RANGE = (start: number, end: number, total: number): string => `Showing ${start}–${end} of ${total}`;

export function TablePagination({ pagination, onPageChange, onPageSizeChange, labels, leading }: TablePaginationProps) {
  const formatRange = labels?.showing ?? DEFAULT_FORMAT_RANGE;
  const view = computePaginationView(pagination, formatRange);
  const prevLabel = labels?.prev ?? "Prev";
  const nextLabel = labels?.next ?? "Next";
  const goToPage = labels?.goToPage ?? ((p: number) => `Go to page ${p}`);
  const rowsPerPageLabel = labels?.rowsPerPage ?? "Rows per page";
  const sizeOptions: number[] = PAGE_SIZE_OPTIONS.includes(pagination.pageSize)
    ? [...PAGE_SIZE_OPTIONS]
    : [...PAGE_SIZE_OPTIONS, pagination.pageSize].sort((a, b) => a - b);

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span>{view.rangeLabel}</span>
        <label className="flex items-center gap-2 text-xs font-medium">
          {rowsPerPageLabel}
          <select
            value={pagination.pageSize}
            onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
            className="h-7 cursor-pointer rounded-md border border-border bg-background px-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            {sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        {leading}
      </span>
      <div className="flex items-center gap-1.5">
        <PageButton disabled={!view.canPrev} ariaLabel={prevLabel} onSelect={() => onPageChange(pagination.page - 1)}>
          ‹ {prevLabel}
        </PageButton>
        {view.items.map((item) => {
          if (item === "ellipsis-left" || item === "ellipsis-right") {
            return (
              <span key={item} aria-hidden className="px-1 text-muted-foreground">
                …
              </span>
            );
          }
          const isActive = item === pagination.page;
          return (
            <PageButton key={item} active={isActive} ariaCurrent={isActive} ariaLabel={goToPage(item)} onSelect={() => onPageChange(item)}>
              {item}
            </PageButton>
          );
        })}
        <PageButton disabled={!view.canNext} ariaLabel={nextLabel} onSelect={() => onPageChange(pagination.page + 1)}>
          {nextLabel} ›
        </PageButton>
      </div>
    </div>
  );
}
