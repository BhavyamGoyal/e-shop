import { isStaff } from "@/server/auth/guard";
import { readSession, type Session } from "@/server/auth/session";
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
