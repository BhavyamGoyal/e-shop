import type { NextRequest } from "next/server";
import { cartController } from "@/server/controllers/cart.controller";
import { handleRequest } from "@/server/http/handler";

export function PUT(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    await cartController.save(await request.json());
    return Response.json({ ok: true });
  });
}
