import type { NextRequest } from "next/server";
import { blogController } from "@/server/controllers/blog.controller";
import { handleRequest } from "@/server/http/handler";

export function PUT(request: NextRequest, context: RouteContext<"/api/admin/blogs/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    return Response.json({ data: await blogController.update(id, await request.json()) });
  });
}

export function DELETE(_request: NextRequest, context: RouteContext<"/api/admin/blogs/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await blogController.remove(id);
    return Response.json({ ok: true });
  });
}
