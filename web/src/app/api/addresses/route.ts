import type { NextRequest } from "next/server";
import { addressController } from "@/server/controllers/address.controller";
import { handleRequest } from "@/server/http/handler";

export const dynamic = "force-dynamic";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => Response.json({ data: await addressController.list() }));
}

export function POST(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> =>
    Response.json({ data: await addressController.create(await request.json().catch(() => null)) }, { status: 201 }),
  );
}
