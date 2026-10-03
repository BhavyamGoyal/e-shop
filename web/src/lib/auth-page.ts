import { redirect } from "next/navigation";
import { readSession, type Session } from "@/server/auth/session";

export async function resolveAuthPage(nextParam: string | string[] | undefined): Promise<string> {
  const next: string = typeof nextParam === "string" ? nextParam : "";
  const session: Session | null = await readSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/");
  return next;
}
