import type { NextRequest } from "next/server";
import { pageController } from "@/server/controllers/page.controller";
import { handleRequest } from "@/server/http/handler";

export function PUT(request: NextRequest, context: RouteContext<"/api/admin/pages/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await pageController.update(id, await request.json());
    return Response.json({ ok: true });
  });
}

export function DELETE(_request: NextRequest, context: RouteContext<"/api/admin/pages/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await pageController.remove(id);
    return Response.json({ ok: true });
  });
}
