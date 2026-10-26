import type { NextRequest } from "next/server";
import { deliveryController } from "@/server/controllers/delivery.controller";
import { handleRequest } from "@/server/http/handler";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> =>
    Response.json({ data: await deliveryController.estimate(request.nextUrl.searchParams) }),
  );
}
