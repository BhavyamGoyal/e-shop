import type { Metadata } from "next";
import type { CatalogData } from "@/lib/catalog";
import { SOCIAL_IMAGE } from "@/lib/site";
import type { ProductDetail } from "@/server/types/product.types";
import type { SeoMeta } from "./seo-meta";

const TITLE_LIMIT = 70;
const DESCRIPTION_LIMIT = 160;

const clip = (text: string, limit: number): string => {
  const flat: string = text.replace(/\s+/g, " ").trim();
  return flat.length > limit ? `${flat.slice(0, limit - 1).trimEnd()}…` : flat;
};

export const NOT_INDEXED: Metadata["robots"] = { index: false, follow: false };

export function productMetadata(product: ProductDetail): SeoMeta {
  return {
    title: clip(product.seo.title ?? product.title, TITLE_LIMIT),
    description: clip(product.seo.description ?? product.descriptionText, DESCRIPTION_LIMIT),
    canonical: `/product/${product.handle}`,
    image: product.images[0]?.url ?? SOCIAL_IMAGE,
  };
}

export function catalogMetadata(catalog: CatalogData): SeoMeta {
  return {
    title: clip(catalog.title, TITLE_LIMIT),
    description: clip(catalog.description, DESCRIPTION_LIMIT),
    canonical: catalog.basePath,
  };
}
