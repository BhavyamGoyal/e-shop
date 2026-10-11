import { orderController } from "@/server/controllers/order.controller";
import { handleRequest } from "@/server/http/handler";

export const dynamic = "force-dynamic";

export function GET(_request: Request, context: RouteContext<"/api/admin/orders/[orderNumber]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { orderNumber } = await context.params;
    return Response.json({ data: await orderController.detail(orderNumber) });
  });
}
