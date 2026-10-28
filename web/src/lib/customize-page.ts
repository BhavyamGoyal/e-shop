import { productController } from "@/server/controllers/product.controller";
import { NotFoundError } from "@/server/http/errors";
import { customizerService } from "@/server/services/customizer.service";
import type { CustomizerRecord } from "@/server/types/customizer.types";
import type { ProductDetail, ProductVariant } from "@/server/types/product.types";
import { isSingleDefault } from "@/lib/variant-title";

export interface CustomizeProduct {
  handle: string;
  title: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  variantId: number | null;
  variantTitle: string | null;
  inStock: boolean;
}

export interface CustomizePageData {
  customizer: CustomizerRecord;
  product: CustomizeProduct;
}

function pickVariant(product: ProductDetail, variantId: number | null): ProductVariant | undefined {
  const requested: ProductVariant | undefined = product.variants.find((item: ProductVariant): boolean => item.id === variantId);
  return requested ?? product.variants.find((item: ProductVariant): boolean => item.available) ?? product.variants[0];
}

export async function buildCustomizePage(
  slug: string,
  handle: string,
  variantId: number | null,
): Promise<CustomizePageData | null> {
  const customizer: CustomizerRecord | null = await customizerService.findActive(slug);
  if (!customizer || !handle) return null;
  let product: ProductDetail;
  try {
    product = await productController.findByHandle(handle);
  } catch (error: unknown) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
  if (product.customizerSlug !== slug) return null;
  const variant: ProductVariant | undefined = pickVariant(product, variantId);
  return {
    customizer,
    product: {
      handle: product.handle,
      title: product.title,
      image: variant?.image ?? product.images[0]?.url ?? null,
      price: variant?.price ?? product.price,
      compareAtPrice: variant ? variant.compareAtPrice : product.compareAtPrice,
      variantId: variant?.id ?? null,
      variantTitle: variant && !isSingleDefault(product.options) ? variant.title : null,
      inStock: variant ? variant.available : product.available,
    },
  };
}
