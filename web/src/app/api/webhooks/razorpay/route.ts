import type { NextRequest } from "next/server";
import { webhookController } from "@/server/controllers/webhook.controller";
import { handleRequest } from "@/server/http/handler";

export function POST(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const rawBody: string = await request.text();
    await webhookController.handle(rawBody, request.headers.get("x-razorpay-signature"));
    return Response.json({ ok: true });
  });
}
