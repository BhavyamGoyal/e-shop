import type { NextRequest } from "next/server";
import { checkoutController } from "@/server/controllers/checkout.controller";
import { handleRequest } from "@/server/http/handler";

export function POST(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> =>
    Response.json(await checkoutController.createOrder(await request.json().catch(() => null))),
  );
}
