import type { ProductDocument } from "../models/product.model";
import type {
  MediaItem,
  ProductDetail,
  ProductSummary,
  ProductVariant,
  VideoItem,
} from "../types/product.types";

type Doc = ProductDocument;
type DocMedia = NonNullable<Doc["images"]>[number];
type DocVideo = NonNullable<Doc["videos"]>[number];
type DocVariant = NonNullable<Doc["variants"]>[number];

const toMedia = (media: DocMedia): MediaItem => ({
  url: media.url,
  alt: media.alt ?? null,
  width: media.width ?? null,
  height: media.height ?? null,
  position: media.position ?? null,
});

const toVideo = (video: DocVideo): VideoItem => ({
  ...toMedia(video),
  duration: video.duration ?? null,
  previewImage: video.previewImage ?? null,
});

const toVariant = (variant: DocVariant): ProductVariant => ({
  id: variant.id ?? 0,
  title: variant.title ?? "",
  sku: variant.sku ?? null,
  price: variant.price ?? 0,
  compareAtPrice: variant.compareAtPrice ?? null,
  available: variant.available ?? true,
  options: variant.options ?? [],
  image: variant.image ?? null,
});

export function toSummary(doc: Doc): ProductSummary {
  const compareAtPrice: number | null = doc.compareAtPrice ?? null;
  const onSale: boolean = compareAtPrice !== null && compareAtPrice > doc.price;
  return {
    id: doc.sourceId,
    handle: doc.handle,
    title: doc.title,
    price: doc.price,
    priceMax: doc.priceMax ?? doc.price,
    compareAtPrice: onSale ? compareAtPrice : null,
    discountPercent:
      onSale && compareAtPrice ? Math.round(((compareAtPrice - doc.price) / compareAtPrice) * 100) : null,
    available: doc.available ?? true,
    productType: doc.productType ?? null,
    tags: doc.tags ?? [],
    collections: doc.collections ?? [],
    image: doc.images?.[0]?.url ?? null,
    hoverImage: doc.images?.[1]?.url ?? null,
    hasVideo: Boolean(doc.videos?.length),
  };
}

export function toDetail(doc: Doc): ProductDetail {
  return {
    ...toSummary(doc),
    sourceUrl: doc.sourceUrl ?? null,
    vendor: doc.vendor ?? null,
    currency: doc.currency ?? "INR",
    descriptionHtml: doc.descriptionHtml ?? "",
    descriptionText: doc.descriptionText ?? "",
    options: (doc.options ?? []).map((option) => ({
      name: option.name ?? "",
      values: option.values ?? [],
    })),
    variants: (doc.variants ?? []).map(toVariant),
    images: (doc.images ?? []).map(toMedia),
    videos: (doc.videos ?? []).map(toVideo),
    externalVideos: (doc.externalVideos ?? []).map((video) => ({
      host: video.host ?? null,
      externalId: video.externalId ?? null,
      url: video.url ?? null,
    })),
    seo: {
      title: doc.seo?.title ?? null,
      description: doc.seo?.description ?? null,
      ogImage: doc.seo?.ogImage ?? null,
    },
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
  };
}
