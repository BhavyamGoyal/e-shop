"use client";

import type { HeaderCellProps } from "@/components/molecules/Table/HeaderCell.types";
import type { SortState } from "@/components/organisms/Table/Table.types";
import { InfoIcon, SearchIcon } from "@/components/atoms/Icons";
import { ColumnDragGrip } from "@/components/atoms/Table/ColumnDragGrip";
import { ColumnResizeHandle } from "@/components/atoms/Table/ColumnResizeHandle";
import { SortButton } from "@/components/atoms/Table/SortButton";
import { useHeaderSearch } from "@/components/molecules/Table/HeaderCell.controller";
import { MIN_COLUMN_WIDTH } from "@/components/organisms/Table/ColumnLayout.controller";

function HeaderInfo({ text, hidden }: { text: string; hidden: boolean }) {
  return (
    <span title={text} aria-label={text} className={`shrink-0 cursor-help opacity-60 ${hidden ? "invisible" : ""}`}>
      <InfoIcon width={12} height={12} aria-hidden />
    </span>
  );
}

const DRAGGING_CLASS = "opacity-40";
const DROP_TARGET_CLASS = "bg-primary/15";

const ALIGN_CLASS = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

export function HeaderCell({
  columnKey,
  label,
  tooltip,
  sortable = false,
  direction = null,
  align = "left",
  className = "",
  style,
  onToggle,
  filterable = false,
  filterText = "",
  onFilterChange,
  filterPlaceholder,
  filterOptions,
  filterAllLabel,
  movable = false,
  gripHandlers,
  dragging = false,
  dropTarget = false,
  width,
  onResize,
  resizeLabel,
}: HeaderCellProps) {
  const search = useHeaderSearch(columnKey, filterText, onFilterChange);
  const { searchOpen } = search;

  const dragClass: string = dragging ? DRAGGING_CLASS : "";
  const backgroundClass: string = dropTarget ? DROP_TARGET_CLASS : "bg-surface";
  const grip = movable && gripHandlers && !searchOpen ? <ColumnDragGrip label={label} {...gripHandlers} /> : null;
  const resizer =
    onResize && width !== undefined ? (
      <ColumnResizeHandle label={resizeLabel ?? `Resize ${label}`} width={width} min={MIN_COLUMN_WIDTH} onResize={(next) => onResize(columnKey, next)} />
    ) : null;

  const active = direction !== null;
  const ariaSort = direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none";

  const baseTh = `group/th sticky top-0 z-20 ${backgroundClass} border-b border-border px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap`;
  const colorClass = active ? "text-primary" : "text-muted-foreground";
  const thClass = `${baseTh} ${ALIGN_CLASS[align]} ${colorClass} ${dragClass} ${className}`;

  function nextSort(): SortState | null {
    if (direction === null) return { columnKey, direction: "asc" };
    if (direction === "asc") return { columnKey, direction: "desc" };
    return null;
  }

  const sortButton = sortable ? <SortButton label={label} direction={direction} onClick={() => onToggle?.(nextSort())} /> : null;

  if (!sortable && !filterable) {
    return (
      <th scope="col" data-column-key={columnKey} style={style} className={thClass}>
        <span className="inline-flex max-w-full items-center gap-1.5">
          {grip}
          <span className="truncate">{label}</span>
          {tooltip && <HeaderInfo text={tooltip} hidden={false} />}
        </span>
        {resizer}
      </th>
    );
  }

  if (filterable && filterOptions) {
    return (
      <th scope="col" aria-sort={sortable ? ariaSort : undefined} data-column-key={columnKey} style={style} className={thClass}>
        <span className="flex w-full items-center gap-2">
          {grip}
          <span className="flex min-w-0 flex-1 items-center gap-1.5">
            {sortable ? (
              <button type="button" onClick={() => onToggle?.(nextSort())} className="min-w-0 flex-1 cursor-pointer truncate text-left transition-colors hover:text-foreground">
                {label}
              </button>
            ) : (
              <span className="block min-w-0 flex-1 truncate">{label}</span>
            )}
            {tooltip && <HeaderInfo text={tooltip} hidden={false} />}
            {sortButton}
          </span>
        </span>
        <select
          aria-label={`${filterPlaceholder ?? "Filter"} — ${label}`}
          value={filterText}
          onChange={(event) => onFilterChange?.(columnKey, event.target.value)}
          className="mt-1 w-full cursor-pointer rounded-sm border border-border bg-background px-1 py-0.5 text-[10px] font-normal normal-case tracking-normal text-foreground outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">{filterAllLabel ?? "All"}</option>
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {resizer}
      </th>
    );
  }

  return (
    <th scope="col" aria-sort={sortable ? ariaSort : undefined} data-column-key={columnKey} style={style} className={thClass}>
      <span className="flex w-full items-center gap-2">
        {grip}
        <span className="relative flex min-w-0 flex-1 items-center gap-1.5">
          <button
            type="button"
            onClick={() => (filterable ? search.openSearch() : onToggle?.(nextSort()))}
            className={`min-w-0 flex-1 cursor-pointer truncate text-left transition-colors hover:text-foreground ${searchOpen ? "invisible" : ""}`}
          >
            {label}
          </button>
          {tooltip && <HeaderInfo text={tooltip} hidden={searchOpen} />}
          {filterable && (
            <button
              type="button"
              aria-label={`${filterPlaceholder ?? "Search"} — ${label}`}
              aria-expanded={searchOpen}
              onMouseDown={(event) => event.preventDefault()}
              onClick={search.openSearch}
              className={`shrink-0 cursor-pointer transition-colors hover:text-foreground ${search.searchActive ? "text-primary" : "opacity-60"} ${searchOpen ? "invisible" : ""}`}
            >
              <SearchIcon width={12} height={12} />
            </button>
          )}
          {filterable && searchOpen && (
            <input
              type="search"
              autoFocus
              autoComplete="off"
              value={search.draft}
              onChange={search.onChange}
              onKeyDown={search.onKeyDown}
              onBlur={search.onBlur}
              placeholder={filterPlaceholder ?? label}
              aria-label={`${label} — ${filterPlaceholder ?? "search"}`}
              className="absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 rounded-sm border border-border bg-background px-1.5 text-xs font-normal normal-case tracking-normal text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
            />
          )}
        </span>
        {sortButton}
      </span>
      {resizer}
    </th>
  );
}
