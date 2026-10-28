import type { NextRequest } from "next/server";
import { customizerController } from "@/server/controllers/customizer.controller";
import { handleRequest } from "@/server/http/handler";

export function POST(request: NextRequest, context: RouteContext<"/api/customizers/[slug]/resolve">): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { slug } = await context.params;
    return Response.json({ data: await customizerController.resolve(slug, await request.json()) });
  });
}
