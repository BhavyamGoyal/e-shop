import { collectionController } from "@/server/controllers/collection.controller";
import { productController } from "@/server/controllers/product.controller";
import { NotFoundError } from "@/server/http/errors";
import type { ProductDetail, ProductQuery } from "@/server/types/product.types";
import { toProduct } from "@/lib/home";
import type { Product } from "@/lib/website-data";

export interface ProductPageData {
  product: ProductDetail;
  related: Product[];
  collection: { handle: string; title: string } | null;
}

const RELATED_LIMIT = 12;

export async function buildProductPage(handle: string): Promise<ProductPageData | null> {
  let product: ProductDetail;
  try {
    product = await productController.findByHandle(handle);
  } catch (error: unknown) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }

  const collectionHandle: string | undefined = product.collections[0];
  const query: ProductQuery = {
    collections: collectionHandle ? [collectionHandle] : [],
    tags: [],
    productTypes: [],
    sort: "newest",
    page: 1,
    limit: RELATED_LIMIT + 1,
  };
  const [page, collection] = await Promise.all([
    productController.search(query),
    collectionHandle ? collectionController.findByHandle(collectionHandle) : null,
  ]);

  return {
    product,
    related: page.data
      .filter((item) => item.handle !== product.handle)
      .slice(0, RELATED_LIMIT)
      .map(toProduct),
    collection: collection ? { handle: collection.handle, title: collection.title } : null,
  };
}
