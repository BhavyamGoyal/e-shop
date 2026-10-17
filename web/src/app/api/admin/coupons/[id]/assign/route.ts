import type { NextRequest } from "next/server";
import { couponController } from "@/server/controllers/coupon.controller";
import { handleRequest } from "@/server/http/handler";

export function POST(request: NextRequest, context: RouteContext<"/api/admin/coupons/[id]/assign">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await couponController.assign(id, await request.json().catch(() => null));
    return Response.json({ ok: true });
  });
}
