import type { ImportRequest, ImportResult, InstagramDashboard } from "@/server/types/instagram.types";
import { JSON_HEADERS, parse } from "./admin-api";

export async function fetchInstagram(): Promise<InstagramDashboard> {
  const body = await fetch("/api/admin/instagram").then(parse<{ data: InstagramDashboard }>);
  return body.data;
}

export async function importInstagram(request: ImportRequest): Promise<ImportResult> {
  const body = await fetch("/api/admin/instagram/import", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(request),
  }).then(parse<{ data: ImportResult }>);
  return body.data;
}

export async function syncInstagram(): Promise<ImportResult> {
  const body = await fetch("/api/admin/instagram/sync", { method: "POST" }).then(parse<{ data: ImportResult }>);
  return body.data;
}
