import { cartController } from "@/server/controllers/cart.controller";
import { handleRequest } from "@/server/http/handler";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => Response.json({ data: await cartController.list() }));
}
