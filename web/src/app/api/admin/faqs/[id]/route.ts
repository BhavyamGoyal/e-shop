import type { NextRequest } from "next/server";
import { faqController } from "@/server/controllers/faq.controller";
import { handleRequest } from "@/server/http/handler";

export function PUT(request: NextRequest, context: RouteContext<"/api/admin/faqs/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await faqController.update(id, await request.json());
    return Response.json({ ok: true });
  });
}

export function DELETE(_request: NextRequest, context: RouteContext<"/api/admin/faqs/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await faqController.remove(id);
    return Response.json({ ok: true });
  });
}
