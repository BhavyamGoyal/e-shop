import type { ProductInput, ProductListRow, VariantInput } from "../types/admin.types";
import type { AdminProduct } from "../repositories/product-admin.repository";

const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export const EMPTY_INPUT: ProductInput = {
  title: "",
  handle: "",
  vendor: "",
  productType: "",
  tags: [],
  collections: [],
  descriptionHtml: "",
  price: 0,
  compareAtPrice: null,
  available: true,
  images: [],
  options: [],
  variants: [],
  seoTitle: "",
  seoDescription: "",
};

export function toDocumentFields(input: ProductInput): Record<string, unknown> {
  const prices: number[] = input.variants.length
    ? input.variants.map((variant: VariantInput): number => variant.price)
    : [input.price];
  const base: number = Date.now();
  return {
    handle: input.handle,
    slug: input.handle,
    title: input.title,
    vendor: input.vendor,
    productType: input.productType,
    tags: input.tags,
    collections: input.collections,
    descriptionHtml: input.descriptionHtml,
    descriptionText: stripHtml(input.descriptionHtml),
    price: Math.min(...prices),
    priceMax: Math.max(...prices),
    compareAtPrice: input.compareAtPrice,
    available: input.available,
    featuredImage: input.images[0]?.url ?? null,
    images: input.images.map((image, index) => ({
      position: index + 1,
      url: image.url,
      alt: image.alt || null,
    })),
    options: input.options.map((option, index) => ({ ...option, position: index + 1 })),
    variants: input.variants.map((variant, index) => ({
      ...variant,
      id: variant.id ?? base + index,
      sku: variant.sku || null,
      image: variant.image || null,
      position: index + 1,
    })),
    seo: {
      title: input.seoTitle || null,
      description: input.seoDescription || null,
      ogImage: input.images[0]?.url ?? null,
    },
  };
}

export function toInput(doc: AdminProduct): ProductInput {
  return {
    title: doc.title,
    handle: doc.handle,
    vendor: doc.vendor ?? "",
    productType: doc.productType ?? "",
    tags: doc.tags ?? [],
    collections: doc.collections ?? [],
    descriptionHtml: doc.descriptionHtml ?? "",
    price: doc.price,
    compareAtPrice: doc.compareAtPrice ?? null,
    available: doc.available ?? true,
    images: (doc.images ?? []).map((image) => ({ url: image.url, alt: image.alt ?? "" })),
    options: (doc.options ?? []).map((option) => ({ name: option.name ?? "", values: option.values ?? [] })),
    variants: (doc.variants ?? []).map((variant) => ({
      id: variant.id ?? null,
      title: variant.title ?? "",
      sku: variant.sku ?? "",
      price: variant.price ?? 0,
      compareAtPrice: variant.compareAtPrice ?? null,
      available: variant.available ?? true,
      options: variant.options ?? [],
      image: variant.image ?? "",
    })),
    seoTitle: doc.seo?.title ?? "",
    seoDescription: doc.seo?.description ?? "",
  };
}

export const toListRow = (doc: AdminProduct): ProductListRow => ({
  id: doc._id.toString(),
  handle: doc.handle,
  title: doc.title,
  price: doc.price,
  available: doc.available ?? true,
  image: doc.images?.[0]?.url ?? null,
  productType: doc.productType ?? null,
});
