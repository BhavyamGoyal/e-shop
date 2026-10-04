import type { NextRequest } from "next/server";
import { queryController } from "@/server/controllers/query.controller";
import { handleRequest } from "@/server/http/handler";

export function POST(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    await queryController.submit(await request.json());
    return Response.json({ ok: true }, { status: 201 });
  });
}
