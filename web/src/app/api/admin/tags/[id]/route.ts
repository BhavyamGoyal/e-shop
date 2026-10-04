import type { NextRequest } from "next/server";
import { tagController } from "@/server/controllers/tag.controller";
import { handleRequest } from "@/server/http/handler";

export function PATCH(request: NextRequest, context: RouteContext<"/api/admin/tags/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await tagController.update(id, await request.json());
    return Response.json({ ok: true });
  });
}

export function DELETE(_request: NextRequest, context: RouteContext<"/api/admin/tags/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await tagController.remove(id);
    return Response.json({ ok: true });
  });
}
