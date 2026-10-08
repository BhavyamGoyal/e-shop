import type { NextRequest } from "next/server";
import { categoryController } from "@/server/controllers/category.controller";
import { handleRequest } from "@/server/http/handler";

export function PATCH(request: NextRequest, context: RouteContext<"/api/admin/categories/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await categoryController.update(id, await request.json());
    return Response.json({ ok: true });
  });
}
