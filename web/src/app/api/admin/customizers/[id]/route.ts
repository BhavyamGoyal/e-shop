import type { NextRequest } from "next/server";
import { customizerController } from "@/server/controllers/customizer.controller";
import { handleRequest } from "@/server/http/handler";

export function PUT(request: NextRequest, context: RouteContext<"/api/admin/customizers/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await customizerController.update(id, await request.json());
    return Response.json({ ok: true });
  });
}

export function DELETE(_request: NextRequest, context: RouteContext<"/api/admin/customizers/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await customizerController.remove(id);
    return Response.json({ ok: true });
  });
}
