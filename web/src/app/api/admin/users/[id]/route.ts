import type { NextRequest } from "next/server";
import { userController } from "@/server/controllers/user.controller";
import { handleRequest } from "@/server/http/handler";

export function PATCH(request: NextRequest, context: RouteContext<"/api/admin/users/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await userController.updateRole(id, await request.json());
    return Response.json({ ok: true });
  });
}
