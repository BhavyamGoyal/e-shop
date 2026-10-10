import { redirect } from "next/navigation";
import { ForbiddenError, UnauthorizedError } from "../http/errors";
import type { UserRole } from "../models/user.model";
import { userRepository, type StoredUser } from "../repositories/user.repository";
import { readSession, type Session } from "./session";

const STAFF_ROLES: UserRole[] = ["admin", "manager"];

export const isStaff = (role: UserRole): boolean => STAFF_ROLES.includes(role);

async function currentSession(): Promise<Session | null> {
  const session: Session | null = await readSession();
  if (!session) return null;
  const user: StoredUser | null = await userRepository.findById(session.userId);
  return user ? { ...session, role: user.role ?? "customer" } : null;
}

export async function requireCustomer(): Promise<StoredUser> {
  const session: Session | null = await readSession();
  if (!session) throw new UnauthorizedError();
  const user: StoredUser | null = await userRepository.findById(session.userId);
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireStaff(): Promise<Session> {
  const session: Session | null = await currentSession();
  if (!session) throw new UnauthorizedError();
  if (!isStaff(session.role)) throw new ForbiddenError("Staff access required");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session: Session | null = await currentSession();
  if (!session) throw new UnauthorizedError();
  if (session.role !== "admin") throw new ForbiddenError(session.role === "manager" ? "Managers have view-only access" : undefined);
  return session;
}

export async function requireAdminPage(): Promise<Session> {
  const session: Session | null = await currentSession();
  if (!session) redirect("/login?next=/admin");
  if (!isStaff(session.role)) redirect("/");
  return session;
}
