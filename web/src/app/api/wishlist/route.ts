import type { NextRequest } from "next/server";
import { wishlistController } from "@/server/controllers/wishlist.controller";
import { handleRequest } from "@/server/http/handler";

export const dynamic = "force-dynamic";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => Response.json({ data: await wishlistController.get() }));
}

export function PUT(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    await wishlistController.save(await request.json().catch(() => null));
    return Response.json({ ok: true });
  });
}
