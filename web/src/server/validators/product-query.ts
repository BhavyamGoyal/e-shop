import { QueryError } from "../http/errors";
import { SORT_OPTIONS, type ProductQuery, type SortOption } from "../types/product.types";

export const DEFAULT_LIMIT = 24;
export const MAX_LIMIT = 100;

const list = (params: URLSearchParams, key: string): string[] =>
  params
    .getAll(key)
    .flatMap((value: string): string[] => value.split(","))
    .map((value: string): string => value.trim())
    .filter(Boolean);

const decimal = (params: URLSearchParams, key: string): number | undefined => {
  const raw: string | null = params.get(key);
  if (raw === null || raw === "") return undefined;
  const value: number = Number(raw);
  if (!Number.isFinite(value) || value < 0) throw new QueryError(`"${key}" must be a non-negative number`);
  return value;
};

const integer = (params: URLSearchParams, key: string, fallback: number, max: number): number => {
  const value: number | undefined = decimal(params, key);
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < 1) throw new QueryError(`"${key}" must be a positive integer`);
  return Math.min(value, max);
};

const flag = (params: URLSearchParams, key: string): boolean | undefined => {
  const raw: string | null = params.get(key);
  if (raw === null || raw === "") return undefined;
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  throw new QueryError(`"${key}" must be true or false`);
};

const sortOption = (params: URLSearchParams): SortOption => {
  const raw: string | null = params.get("sort");
  if (!raw) return "newest";
  if ((SORT_OPTIONS as readonly string[]).includes(raw)) return raw as SortOption;
  throw new QueryError(`"sort" must be one of: ${SORT_OPTIONS.join(", ")}`);
};

export function parseProductQuery(params: URLSearchParams): ProductQuery {
  const query: ProductQuery = {
    q: params.get("q")?.trim() || undefined,
    collections: list(params, "collection"),
    categories: list(params, "category"),
    tags: list(params, "tag"),
    productTypes: list(params, "productType"),
    minPrice: decimal(params, "minPrice"),
    maxPrice: decimal(params, "maxPrice"),
    available: flag(params, "available"),
    onSale: flag(params, "onSale"),
    hasVideo: flag(params, "hasVideo"),
    sort: sortOption(params),
    page: integer(params, "page", 1, Number.MAX_SAFE_INTEGER),
    limit: integer(params, "limit", DEFAULT_LIMIT, MAX_LIMIT),
  };
  if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
    throw new QueryError('"minPrice" cannot be greater than "maxPrice"');
  }
  return query;
}
