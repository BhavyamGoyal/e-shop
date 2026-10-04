import type {
  ImageListPage,
  ImageRecord,
  ProductListPage,
  TagPatch,
  TagRecord,
  UserRecord,
  UserRoleName,
} from "@/server/types/admin.types";
import type { BlogInput, BlogRow, FaqInput, FaqListData } from "@/server/types/content.types";

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

const JSON_HEADERS: HeadersInit = { "Content-Type": "application/json" };

export async function fetchTags(): Promise<TagRecord[]> {
  const body = await fetch("/api/admin/tags").then(parse<{ data: TagRecord[] }>);
  return body.data;
}

export async function createTag(name: string): Promise<void> {
  await fetch("/api/admin/tags", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ name }) }).then(
    parse<{ data: TagRecord }>,
  );
}

export async function updateTag(id: string, patch: TagPatch): Promise<void> {
  await fetch(`/api/admin/tags/${id}`, { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(patch) }).then(
    parse<{ ok: boolean }>,
  );
}

export async function deleteTag(id: string): Promise<void> {
  await fetch(`/api/admin/tags/${id}`, { method: "DELETE" }).then(parse<{ ok: boolean }>);
}

export async function fetchBlogs(): Promise<BlogRow[]> {
  const body = await fetch("/api/admin/blogs").then(parse<{ data: BlogRow[] }>);
  return body.data;
}

export async function saveBlog(id: string | null, input: BlogInput): Promise<{ id: string; slug: string }> {
  const body = await fetch(id ? `/api/admin/blogs/${id}` : "/api/admin/blogs", {
    method: id ? "PUT" : "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  }).then(parse<{ data: { id: string; slug: string } }>);
  return body.data;
}

export async function deleteBlog(id: string): Promise<void> {
  await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" }).then(parse<{ ok: boolean }>);
}

export async function fetchFaqs(): Promise<FaqListData> {
  const body = await fetch("/api/admin/faqs").then(parse<{ data: FaqListData }>);
  return body.data;
}

export async function saveFaq(id: string | null, input: FaqInput): Promise<void> {
  await fetch(id ? `/api/admin/faqs/${id}` : "/api/admin/faqs", {
    method: id ? "PUT" : "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  }).then(parse<{ ok: boolean }>);
}

export async function deleteFaq(id: string): Promise<void> {
  await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" }).then(parse<{ ok: boolean }>);
}

export async function fetchUsers(): Promise<UserRecord[]> {
  const body = await fetch("/api/admin/users").then(parse<{ data: UserRecord[] }>);
  return body.data;
}

export async function updateUserRole(id: string, role: UserRoleName): Promise<void> {
  await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ role }),
  }).then(parse<{ ok: boolean }>);
}
