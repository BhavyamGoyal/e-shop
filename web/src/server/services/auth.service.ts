import { hashPassword, verifyPassword } from "../auth/password";
import type { Session } from "../auth/session";
import { ValidationError } from "../http/errors";
import { userRepository, type StoredUser } from "../repositories/user.repository";

const ADMIN_EMAIL = "admin@tinglet.com";
const ADMIN_PASSWORD = "tinglet@2026#123";
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const globalScope = globalThis as unknown as { adminSeeded?: boolean };

const toSession = (user: StoredUser): Session => ({
  userId: user._id.toString(),
  email: user.email,
  role: user.role ?? "customer",
});

export async function ensureAdminUser(): Promise<void> {
  if (globalScope.adminSeeded) return;
  const existing: StoredUser | null = await userRepository.findByEmail(ADMIN_EMAIL);
  if (!existing) {
    await userRepository.create({
      name: "Admin",
      email: ADMIN_EMAIL,
      passwordHash: await hashPassword(ADMIN_PASSWORD),
      role: "admin",
    });
  }
  globalScope.adminSeeded = true;
}

export async function loginUser(email: string, password: string): Promise<Session> {
  await ensureAdminUser();
  const user: StoredUser | null = await userRepository.findByEmail(email);
  const valid: boolean = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid) throw new ValidationError("Invalid email or password");
  return toSession(user);
}

export async function registerUser(name: string, email: string, password: string): Promise<Session> {
  await ensureAdminUser();
  if (!EMAIL_PATTERN.test(email)) throw new ValidationError("Enter a valid email address");
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ValidationError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (await userRepository.findByEmail(email)) {
    throw new ValidationError("An account with this email already exists");
  }
  const user: StoredUser = await userRepository.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: await hashPassword(password),
    role: "customer",
  });
  return toSession(user);
}
