import type { NextRequest } from "next/server";
import { pageController } from "@/server/controllers/page.controller";
import { handleRequest } from "@/server/http/handler";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => Response.json({ data: await pageController.list() }));
}

export function POST(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    await pageController.create(await request.json());
    return Response.json({ ok: true }, { status: 201 });
  });
}
