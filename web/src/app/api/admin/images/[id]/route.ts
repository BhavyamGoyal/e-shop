import type { NextRequest } from "next/server";
import { imageController } from "@/server/controllers/image.controller";
import { handleRequest } from "@/server/http/handler";

export function DELETE(
  _request: NextRequest,
  context: RouteContext<"/api/admin/images/[id]">,
): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await imageController.remove(id);
    return Response.json({ ok: true });
  });
}
