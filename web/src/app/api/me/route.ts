import { readSession } from "@/server/auth/session";
import { handleRequest } from "@/server/http/handler";
import { currentProfile } from "@/server/services/auth.service";

export const dynamic = "force-dynamic";

export function GET(): Promise<Response> {
  return handleRequest(
    async (): Promise<Response> => Response.json({ data: await currentProfile(await readSession()) }),
  );
}
