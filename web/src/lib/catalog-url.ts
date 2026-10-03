import type { ProductQuery } from "@/server/types/product.types";

export type RawParams = Record<string, string | string[] | undefined>;

export const toSearchParams = (raw: RawParams): URLSearchParams => {
  const params: URLSearchParams = new URLSearchParams();
  Object.entries(raw).forEach(([key, value]: [string, string | string[] | undefined]): void => {
    const values: string[] = Array.isArray(value) ? value : value === undefined ? [] : [value];
    values.forEach((item: string): void => params.append(key, item));
  });
  return params;
};

export const buildQueryString = (query: ProductQuery, page: number): string => {
  const params: URLSearchParams = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  query.productTypes.forEach((value: string): void => params.append("productType", value));
  query.tags.forEach((value: string): void => params.append("tag", value));
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  if (query.available) params.set("available", "true");
  if (query.onSale) params.set("onSale", "true");
  if (query.sort !== "newest") params.set("sort", query.sort);
  if (page > 1) params.set("page", String(page));
  const text: string = params.toString();
  return text ? `?${text}` : "";
};
