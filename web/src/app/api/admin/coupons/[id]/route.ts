import type { NextRequest } from "next/server";
import { couponController } from "@/server/controllers/coupon.controller";
import { handleRequest } from "@/server/http/handler";

export function PUT(request: NextRequest, context: RouteContext<"/api/admin/coupons/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await couponController.update(id, await request.json().catch(() => null));
    return Response.json({ ok: true });
  });
}

export function DELETE(_request: NextRequest, context: RouteContext<"/api/admin/coupons/[id]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id } = await context.params;
    await couponController.remove(id);
    return Response.json({ ok: true });
  });
}
