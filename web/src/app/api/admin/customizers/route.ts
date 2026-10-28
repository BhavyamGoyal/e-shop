import type { NextRequest } from "next/server";
import { customizerController } from "@/server/controllers/customizer.controller";
import { handleRequest } from "@/server/http/handler";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => Response.json({ data: await customizerController.list() }));
}

export function POST(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    await customizerController.create(await request.json());
    return Response.json({ ok: true }, { status: 201 });
  });
}
