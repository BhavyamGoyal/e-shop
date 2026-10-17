import { requireCustomer } from "@/server/auth/guard";
import { handleRequest } from "@/server/http/handler";
import type { StoredUser } from "@/server/repositories/user.repository";

export const dynamic = "force-dynamic";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const user: StoredUser = await requireCustomer();
    return Response.json({ balance: user.tinglePoints ?? 0 });
  });
}
