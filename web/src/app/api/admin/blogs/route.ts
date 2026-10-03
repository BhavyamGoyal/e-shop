import type { NextRequest } from "next/server";
import { blogController } from "@/server/controllers/blog.controller";
import { handleRequest } from "@/server/http/handler";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => Response.json({ data: await blogController.adminList() }));
}

export function POST(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> =>
    Response.json({ data: await blogController.create(await request.json()) }, { status: 201 }),
  );
}
