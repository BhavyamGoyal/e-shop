import type { NextRequest } from "next/server";
import { addressController } from "@/server/controllers/address.controller";
import { handleRequest } from "@/server/http/handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function PUT(request: NextRequest, { params }: RouteContext): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id }: { id: string } = await params;
    return Response.json({ data: await addressController.update(id, await request.json().catch(() => null)) });
  });
}

export function DELETE(_request: NextRequest, { params }: RouteContext): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const { id }: { id: string } = await params;
    await addressController.remove(id);
    return Response.json({ ok: true });
  });
}
