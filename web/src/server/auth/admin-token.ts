import { userRepository, type StoredUser } from "../repositories/user.repository";
import { decodeSession, type Session } from "./session-token";

export async function isAdminToken(token: string | undefined): Promise<boolean> {
  const session: Session | null = decodeSession(token);
  if (!session) return false;
  const user: StoredUser | null = await userRepository.findById(session.userId);
  return user?.role === "admin";
}
