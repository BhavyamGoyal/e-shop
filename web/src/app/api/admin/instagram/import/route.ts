import type { NextRequest } from "next/server";
import { instagramController } from "@/server/controllers/instagram.controller";
import { handleRequest } from "@/server/http/handler";

export function POST(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> =>
    Response.json({ data: await instagramController.importFile(await request.json()) }, { status: 201 }),
  );
}
