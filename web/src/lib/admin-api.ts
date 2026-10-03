import type { ImageListPage, ImageRecord, ProductListPage } from "@/server/types/admin.types";

interface ErrorBody {
  error?: string;
}

async function parse<T>(response: Response): Promise<T> {
  const body: T & ErrorBody = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body;
}

export function fetchImages(page: number, search: string): Promise<ImageListPage> {
  const params: URLSearchParams = new URLSearchParams({ page: String(page) });
  if (search) params.set("q", search);
  return fetch(`/api/admin/images?${params.toString()}`).then(parse<ImageListPage>);
}

export async function uploadImage(file: File): Promise<ImageRecord> {
  const form: FormData = new FormData();
  form.append("file", file);
  const body = await fetch("/api/admin/images", { method: "POST", body: form }).then(
    parse<{ data: ImageRecord }>,
  );
  return body.data;
}

export async function deleteImage(id: string): Promise<void> {
  await fetch(`/api/admin/images/${id}`, { method: "DELETE" }).then(parse<{ ok: boolean }>);
}

export interface ProductsRequest {
  page: number;
  limit: number;
  sort: string | null;
  filters: Record<string, string>;
}

export function fetchProducts(request: ProductsRequest): Promise<ProductListPage> {
  const params: URLSearchParams = new URLSearchParams({ page: String(request.page), limit: String(request.limit) });
  if (request.sort) params.set("sort", request.sort);
  Object.entries(request.filters).forEach(([key, value]: [string, string]): void => {
    if (value.trim()) params.set(key, value.trim());
  });
  return fetch(`/api/admin/products?${params.toString()}`).then(parse<ProductListPage>);
}
