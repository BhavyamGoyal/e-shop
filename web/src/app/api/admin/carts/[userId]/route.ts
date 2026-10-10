import { cartController } from "@/server/controllers/cart.controller";
import { handleRequest } from "@/server/http/handler";

export function GET(_request: Request, context: RouteContext<"/api/admin/carts/[userId]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { userId } = await context.params;
    return Response.json({ data: await cartController.detail(userId) });
  });
}
