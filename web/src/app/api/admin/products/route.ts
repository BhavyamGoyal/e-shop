import type { NextRequest } from "next/server";
import { productAdminController } from "@/server/controllers/product-admin.controller";
import { handleRequest } from "@/server/http/handler";
import type { ProductListQuery } from "@/server/types/admin.types";

const MAX_LIMIT = 1000;

const positive = (value: string | null, fallback: number): number => {
  const parsed: number = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

function parseQuery(params: URLSearchParams): ProductListQuery {
  const [sortKey, sortDir] = (params.get("sort") ?? "").split(":");
  const available: string | null = params.get("available");
  return {
    page: positive(params.get("page"), 1),
    limit: Math.min(positive(params.get("limit"), 20), MAX_LIMIT),
    sortKey: sortKey || null,
    sortDir: sortDir === "desc" ? "desc" : "asc",
    title: params.get("title")?.trim() ?? "",
    productType: params.get("productType")?.trim() ?? "",
    available: available === "true" ? true : available === "false" ? false : null,
  };
}

export function GET(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> =>
    Response.json(await productAdminController.list(parseQuery(request.nextUrl.searchParams))),
  );
}
