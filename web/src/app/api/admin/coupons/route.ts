import type { NextRequest } from "next/server";
import { couponController } from "@/server/controllers/coupon.controller";
import { handleRequest } from "@/server/http/handler";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => Response.json({ data: await couponController.list() }));
}

export function POST(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    await couponController.create(await request.json().catch(() => null));
    return Response.json({ ok: true }, { status: 201 });
  });
}
