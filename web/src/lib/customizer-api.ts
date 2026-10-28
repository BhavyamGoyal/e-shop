import type { CartCustomization, ParamValues } from "@/customizers/core";
import type { CustomizerInput, CustomizerRecord } from "@/server/types/customizer.types";
import { JSON_HEADERS, parse } from "./admin-api";

export async function fetchCustomizers(): Promise<CustomizerRecord[]> {
  const body = await fetch("/api/admin/customizers").then(parse<{ data: CustomizerRecord[] }>);
  return body.data;
}

export async function saveCustomizer(id: string | null, input: CustomizerInput): Promise<void> {
  await fetch(id ? `/api/admin/customizers/${id}` : "/api/admin/customizers", {
    method: id ? "PUT" : "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  }).then(parse<{ ok: boolean }>);
}

export async function deleteCustomizer(id: string): Promise<void> {
  await fetch(`/api/admin/customizers/${id}`, { method: "DELETE" }).then(parse<{ ok: boolean }>);
}

export async function resolveCustomization(slug: string, params: ParamValues): Promise<CartCustomization> {
  const body = await fetch(`/api/customizers/${encodeURIComponent(slug)}/resolve`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ params }),
  }).then(parse<{ data: CartCustomization }>);
  return body.data;
}

export async function fetchCustomizer(slug: string): Promise<CustomizerRecord> {
  const body = await fetch(`/api/customizers/${encodeURIComponent(slug)}`).then(parse<{ data: CustomizerRecord }>);
  return body.data;
}
