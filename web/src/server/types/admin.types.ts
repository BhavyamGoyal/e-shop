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

export interface TagFields {
  icon: string;
  image: string;
  header: boolean;
  collection: boolean;
}

export interface TagRecord extends TagFields {
  id: string;
  name: string;
  productCount: number;
}

export type TagPatch = Partial<TagFields> & { name?: string };

export interface CategoryFields {
  image: string;
  icon: string;
  description: string;
  position: number;
  showOnHome: boolean;
  active: boolean;
}

export interface CategoryRecord extends CategoryFields {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export type CategoryPatch = Partial<CategoryFields> & { name?: string };

export type UserRoleName = "admin" | "manager" | "customer";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  image: string;
  role: UserRoleName;
  createdAt: string;
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
  categories: string[];
  collections: string[];
  descriptionHtml: string;
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  active: boolean;
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
  active: boolean;
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
