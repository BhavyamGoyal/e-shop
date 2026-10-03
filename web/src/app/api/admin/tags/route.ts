import type { NextRequest } from "next/server";
import { tagController } from "@/server/controllers/tag.controller";
import { handleRequest } from "@/server/http/handler";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => Response.json({ data: await tagController.list() }));
}

export function POST(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> =>
    Response.json({ data: await tagController.create(await request.json()) }, { status: 201 }),
  );
}
