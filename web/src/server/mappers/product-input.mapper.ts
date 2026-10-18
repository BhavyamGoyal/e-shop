import type { CostInput, MetaDataInput, ProductInput, ProductListRow, VariantInput } from "../types/admin.types";
import type { AdminProduct } from "../repositories/product-admin.repository";

const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export const EMPTY_INPUT: ProductInput = {
  title: "",
  handle: "",
  vendor: "",
  productType: "",
  tags: [],
  categories: [],
  collections: [],
  descriptionHtml: "",
  price: 0,
  compareAtPrice: null,
  available: true,
  active: true,
  images: [],
  options: [],
  variants: [],
  costs: [],
  seoTitle: "",
  seoDescription: "",
  reviewed: { description: false, images: false, title: false },
  metaData: [],
};

const parseMetaValue = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const formatMetaValue = (value: unknown): string =>
  typeof value === "string" ? value : JSON.stringify(value) ?? "";

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
    categories: input.categories,
    collections: input.collections,
    descriptionHtml: input.descriptionHtml,
    descriptionText: stripHtml(input.descriptionHtml),
    price: Math.min(...prices),
    priceMax: Math.max(...prices),
    compareAtPrice: input.compareAtPrice,
    available: input.available,
    active: input.active,
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
    costs: input.costs,
    reviewed: input.reviewed,
    metaData: Object.fromEntries(
      input.metaData.map((entry: MetaDataInput): [string, unknown] => [entry.key, parseMetaValue(entry.value)]),
    ),
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
    categories: doc.categories ?? [],
    collections: doc.collections ?? [],
    descriptionHtml: doc.descriptionHtml ?? "",
    price: doc.price,
    compareAtPrice: doc.compareAtPrice ?? null,
    available: doc.available ?? true,
    active: doc.active ?? true,
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
    costs: (doc.costs ?? []).map((cost) => ({ name: cost.name ?? "", amount: cost.amount ?? 0 })),
    seoTitle: doc.seo?.title ?? "",
    seoDescription: doc.seo?.description ?? "",
    reviewed: {
      description: doc.reviewed?.description ?? false,
      images: doc.reviewed?.images ?? false,
      title: doc.reviewed?.title ?? false,
    },
    metaData: Object.entries((doc.metaData ?? {}) as Record<string, unknown>).map(
      ([key, value]): MetaDataInput => ({ key, value: formatMetaValue(value) }),
    ),
  };
}

export const toListRow = (doc: AdminProduct): ProductListRow => ({
  id: doc._id.toString(),
  handle: doc.handle,
  title: doc.title,
  price: doc.price,
  totalCost: (doc.costs ?? []).reduce((sum: number, cost): number => sum + (cost.amount ?? 0), 0),
  available: doc.available ?? true,
  active: doc.active ?? true,
  image: doc.images?.[0]?.url ?? null,
  productType: doc.productType ?? null,
  tags: doc.tags ?? [],
});
