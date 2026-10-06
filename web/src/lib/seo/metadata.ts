import type { Metadata } from "next";
import type { CatalogData } from "@/lib/catalog";
import { SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";
import type { ProductDetail } from "@/server/types/product.types";

const TITLE_LIMIT = 70;
const DESCRIPTION_LIMIT = 160;

const clip = (text: string, limit: number): string => {
  const flat: string = text.replace(/\s+/g, " ").trim();
  return flat.length > limit ? `${flat.slice(0, limit - 1).trimEnd()}…` : flat;
};

export const NOT_INDEXED: Metadata["robots"] = { index: false, follow: false };

export function productMetadata(product: ProductDetail): Metadata {
  const path: string = `/product/${product.handle}`;
  const title: string = clip(product.seo.title ?? product.title, TITLE_LIMIT);
  const description: string = clip(product.seo.description ?? product.descriptionText, DESCRIPTION_LIMIT);
  const image: string = product.images[0]?.url ?? SOCIAL_IMAGE;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      images: [{ url: image }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export function catalogMetadata(catalog: CatalogData, filtered: boolean): Metadata {
  const title: string = clip(catalog.title, TITLE_LIMIT);
  const description: string = clip(catalog.description, DESCRIPTION_LIMIT);
  return {
    title,
    description,
    alternates: { canonical: catalog.basePath },
    robots: filtered ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: catalog.basePath,
      images: [{ url: SOCIAL_IMAGE }],
    },
    twitter: { card: "summary_large_image", title, description, images: [SOCIAL_IMAGE] },
  };
}
