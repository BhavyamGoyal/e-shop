import { redirect } from "next/navigation";
import { ForbiddenError, UnauthorizedError } from "../http/errors";
import { readSession, type Session } from "./session";

export async function requireAdmin(): Promise<Session> {
  const session: Session | null = await readSession();
  if (!session) throw new UnauthorizedError();
  if (session.role !== "admin") throw new ForbiddenError();
  return session;
}

export async function requireAdminPage(): Promise<Session> {
  const session: Session | null = await readSession();
  if (!session) redirect("/login?next=/admin");
  if (session.role !== "admin") redirect("/");
  return session;
}
