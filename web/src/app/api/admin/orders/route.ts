import { orderController } from "@/server/controllers/order.controller";
import { handleRequest } from "@/server/http/handler";

export const dynamic = "force-dynamic";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => Response.json({ data: await orderController.listAll() }));
}
