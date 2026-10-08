import type { ProductSummary } from "@/server/types/product.types";
import type { Product } from "@/lib/website-data";

export const toProduct = (product: ProductSummary): Product => ({
  href: `/product/${product.handle}`,
  image: product.image ?? "",
  name: product.title,
  price: product.price,
  mrp: product.compareAtPrice ?? undefined,
  discountLabel: product.discountPercent
    ? `${product.discountPercent}% OFF`
    : undefined,
});
