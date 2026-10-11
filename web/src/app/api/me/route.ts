import type { NextRequest } from "next/server";
import { isStaff } from "@/server/auth/guard";
import { readSession, type Session } from "@/server/auth/session";
import { profileController } from "@/server/controllers/profile.controller";
import { handleRequest } from "@/server/http/handler";
import { currentProfile } from "@/server/services/auth.service";

export const dynamic = "force-dynamic";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const session: Session | null = await readSession();
    return Response.json({
      data: await currentProfile(session),
      landing: session ? (isStaff(session.role) ? "/admin" : "/") : null,
    });
  });
}

export function PUT(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> =>
    Response.json({ data: await profileController.update(await request.json().catch(() => null)) }),
  );
}
