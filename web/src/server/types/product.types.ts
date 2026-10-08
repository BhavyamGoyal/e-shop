export const SORT_OPTIONS = [
  "newest",
  "oldest",
  "price-asc",
  "price-desc",
  "title-asc",
  "title-desc",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export interface ProductQuery {
  q?: string;
  collections: string[];
  categories: string[];
  tags: string[];
  productTypes: string[];
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  onSale?: boolean;
  hasVideo?: boolean;
  sort: SortOption;
  page: number;
  limit: number;
}

export interface ProductSummary {
  id: number;
  handle: string;
  title: string;
  price: number;
  priceMax: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  available: boolean;
  productType: string | null;
  tags: string[];
  collections: string[];
  image: string | null;
  hoverImage: string | null;
  hasVideo: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductPage {
  data: ProductSummary[];
  meta: Pagination;
}

export interface StorefrontCategory {
  name: string;
  slug: string;
  href: string;
  icon: string;
  image: string;
  description: string;
  count: number;
}

export interface CollectionSummary {
  handle: string;
  title: string;
  count: number;
  image: string | null;
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface CatalogFacets {
  productTypes: FacetValue[];
  tags: FacetValue[];
  minPrice: number;
  maxPrice: number;
}

export interface MediaItem {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  position: number | null;
}

export interface VideoItem extends MediaItem {
  duration: number | null;
  previewImage: string | null;
}

export interface ExternalVideo {
  host: string | null;
  externalId: string | null;
  url: string | null;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: number;
  title: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  options: string[];
  image: string | null;
}

export interface ProductDetail extends ProductSummary {
  sourceUrl: string | null;
  vendor: string | null;
  currency: string;
  descriptionHtml: string;
  descriptionText: string;
  options: ProductOption[];
  variants: ProductVariant[];
  images: MediaItem[];
  videos: VideoItem[];
  externalVideos: ExternalVideo[];
  seo: { title: string | null; description: string | null; ogImage: string | null };
  publishedAt: string | null;
}
