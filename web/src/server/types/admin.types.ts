export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ImageRecord {
  id: string;
  url: string;
  filename: string;
  size: number;
  createdAt: string;
}

export interface ImageListPage {
  data: ImageRecord[];
  meta: PageMeta;
}

export interface TagRecord {
  id: string;
  name: string;
  productCount: number;
}

export interface ImageInput {
  url: string;
  alt: string;
}

export interface OptionInput {
  name: string;
  values: string[];
}

export interface VariantInput {
  id: number | null;
  title: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  options: string[];
  image: string;
}

export interface ProductInput {
  title: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];
  collections: string[];
  descriptionHtml: string;
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  images: ImageInput[];
  options: OptionInput[];
  variants: VariantInput[];
  seoTitle: string;
  seoDescription: string;
}

export interface ProductListRow {
  id: string;
  handle: string;
  title: string;
  price: number;
  available: boolean;
  image: string | null;
  productType: string | null;
  tags: string[];
}

export interface ProductListPage {
  data: ProductListRow[];
  meta: PageMeta;
}

export interface ProductEditorData {
  id: string | null;
  input: ProductInput;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
  handle?: string;
}

export interface ProductListQuery {
  page: number;
  limit: number;
  sortKey: string | null;
  sortDir: "asc" | "desc";
  title: string;
  productType: string;
  available: boolean | null;
}
