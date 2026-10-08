import { QueryError } from "@/server/http/errors";
import { productController } from "@/server/controllers/product.controller";
import { collectionController } from "@/server/controllers/collection.controller";
import { storefrontCategoryController } from "@/server/controllers/storefront-category.controller";
import { parseProductQuery } from "@/server/validators/product-query";
import type {
  CatalogFacets,
  Pagination,
  ProductQuery,
  StorefrontCategory,
} from "@/server/types/product.types";
import { toSearchParams, type RawParams } from "@/lib/catalog-url";
import { toProduct } from "@/lib/product-mapper";
import type { Product } from "@/lib/website-data";

export interface CatalogData {
  title: string;
  description: string;
  basePath: string;
  query: ProductQuery;
  facets: CatalogFacets;
  meta: Pagination;
  products: Product[];
}

const ALL_PATH = "/product";

const parseQuery = (raw: RawParams): ProductQuery => {
  try {
    return parseProductQuery(toSearchParams(raw));
  } catch (error: unknown) {
    if (error instanceof QueryError)
      return parseProductQuery(new URLSearchParams());
    throw error;
  }
};

export async function buildCategoryCatalogData(slug: string): Promise<CatalogData | null> {
  const category: StorefrontCategory | null = await storefrontCategoryController.find(slug);
  if (!category) return null;

  const query: ProductQuery = { ...parseQuery({}), categories: [slug], tags: [], collections: [] };
  const [page, facets] = await Promise.all([
    productController.search(query),
    productController.facets([]),
  ]);

  return {
    title: category.name,
    description: category.description || `${page.meta.total} ${category.name} designs, 3D Printed to order.`,
    basePath: category.href,
    query,
    facets,
    meta: page.meta,
    products: page.data.map(toProduct),
  };
}

export async function buildCatalogData(
  handle: string | null,
  raw: RawParams,
): Promise<CatalogData | null> {
  const collection = handle
    ? await collectionController.findByHandle(handle)
    : null;
  if (handle && !collection) return null;

  const parsed: ProductQuery = parseQuery(raw);
  const collections: string[] = handle ? [handle] : [];
  const query: ProductQuery = { ...parsed, collections };

  const [page, facets] = await Promise.all([
    productController.search(query),
    productController.facets(collections),
  ]);

  return {
    title: collection ? collection.title : "All Products",
    description: collection
      ? `${collection.count} designs in ${collection.title}, 3D Printed to order.`
      : "Every lamp, planter, organiser and gift in the studio.",
    basePath: collection ? `/${collection.handle}` : ALL_PATH,
    query,
    facets,
    meta: page.meta,
    products: page.data.map(toProduct),
  };
}
