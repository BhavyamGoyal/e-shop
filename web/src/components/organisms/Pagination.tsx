import { cn } from "@/lib/cn";
import { buildQueryString } from "@/lib/catalog-url";
import type { Pagination as PaginationMeta, ProductQuery } from "@/server/types/product.types";

interface PaginationProps {
  meta: PaginationMeta;
  query: ProductQuery;
  basePath: string;
}

const WINDOW = 2;

const pageList = (current: number, total: number): number[] => {
  const pages: number[] = [];
  for (let page = 1; page <= total; page += 1) {
    if (page === 1 || page === total || Math.abs(page - current) <= WINDOW) pages.push(page);
  }
  return pages;
};

const linkClass = (active: boolean): string =>
  cn(
    "grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-medium",
    active ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:border-primary",
  );

export function Pagination({ meta, query, basePath }: PaginationProps) {
  if (meta.totalPages <= 1) return null;
  const href = (page: number): string => `${basePath}${buildQueryString(query, page)}`;
  const pages: number[] = pageList(meta.page, meta.totalPages);
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {meta.page > 1 && (
        <a href={href(meta.page - 1)} className={linkClass(false)}>
          Previous
        </a>
      )}
      {pages.map((page: number, index: number) => (
        <span key={page} className="flex items-center gap-2">
          {index > 0 && page - pages[index - 1] > 1 && <span className="text-muted-foreground">…</span>}
          <a
            href={href(page)}
            aria-current={page === meta.page ? "page" : undefined}
            className={linkClass(page === meta.page)}
          >
            {page}
          </a>
        </span>
      ))}
      {meta.page < meta.totalPages && (
        <a href={href(meta.page + 1)} className={linkClass(false)}>
          Next
        </a>
      )}
    </nav>
  );
}
