import type { NextRequest } from "next/server";
import { faqController } from "@/server/controllers/faq.controller";
import { handleRequest } from "@/server/http/handler";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => Response.json({ data: await faqController.list() }));
}

export function POST(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    await faqController.create(await request.json());
    return Response.json({ ok: true }, { status: 201 });
  });
}
