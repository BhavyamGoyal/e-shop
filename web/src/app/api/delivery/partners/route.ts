import { deliveryController } from "@/server/controllers/delivery.controller";
import { handleRequest } from "@/server/http/handler";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => Response.json({ data: deliveryController.partners() }));
}
