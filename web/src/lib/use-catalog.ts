"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import type { CatalogData } from "@/lib/catalog";
import { toProduct } from "@/lib/product-mapper";
import type { Product } from "@/lib/website-data";
import { QueryError } from "@/server/http/errors";
import type { Pagination, ProductPage, ProductQuery } from "@/server/types/product.types";
import { parseProductQuery } from "@/server/validators/product-query";

interface Loaded {
  search: string;
  products: Product[];
  meta: Pagination;
}

export interface CatalogState {
  search: string;
  loading: boolean;
  query: ProductQuery;
  products: Product[];
  meta: Pagination;
}

const searchOf = (asPath: string): string => asPath.split("#")[0].split("?")[1] ?? "";

const scopedParams = (search: string, base: ProductQuery): URLSearchParams => {
  const params: URLSearchParams = new URLSearchParams(search);
  params.delete("collection");
  params.delete("category");
  base.collections.forEach((value: string): void => params.append("collection", value));
  base.categories.forEach((value: string): void => params.append("category", value));
  return params;
};

const parseScoped = (search: string, base: ProductQuery): ProductQuery => {
  try {
    return parseProductQuery(scopedParams(search, base));
  } catch (error: unknown) {
    if (error instanceof QueryError) return base;
    throw error;
  }
};

export function useCatalog(initial: CatalogData): CatalogState {
  const router = useRouter();
  const search: string = router.isReady ? searchOf(router.asPath) : "";
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect((): (() => void) | void => {
    if (!search) return;
    const controller: AbortController = new AbortController();
    const params: string = scopedParams(search, initial.query).toString();
    fetch(`/api/products?${params}`, { signal: controller.signal })
      .then((response: Response): Promise<ProductPage> => {
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        return response.json();
      })
      .then((page: ProductPage): void => {
        setFailed(null);
        setLoaded({ search, products: page.data.map(toProduct), meta: page.meta });
      })
      .catch((): void => {
        if (!controller.signal.aborted) setFailed(search);
      });
    return (): void => controller.abort();
  }, [search, initial.query]);

  const query: ProductQuery = useMemo(
    (): ProductQuery => (search ? parseScoped(search, initial.query) : initial.query),
    [search, initial.query],
  );

  if (!search || failed === search) {
    return { search, loading: false, query: initial.query, products: initial.products, meta: initial.meta };
  }
  if (loaded?.search !== search) {
    return { search, loading: true, query, products: [], meta: initial.meta };
  }
  return { search, loading: false, query, products: loaded.products, meta: loaded.meta };
}
