import type { NextRequest } from "next/server";
import { customizerController } from "@/server/controllers/customizer.controller";
import { handleRequest } from "@/server/http/handler";

export function GET(_request: NextRequest, context: RouteContext<"/api/customizers/[slug]">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { slug } = await context.params;
    return Response.json({ data: await customizerController.findActive(slug) });
  });
}
