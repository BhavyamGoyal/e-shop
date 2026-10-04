import { requireAdmin, requireStaff } from "../auth/guard";
import type { Session } from "../auth/session";
import { ForbiddenError, NotFoundError, ValidationError } from "../http/errors";
import { USER_ROLES } from "../models/user.model";
import { userRepository, type StoredUser } from "../repositories/user.repository";
import type { UserRecord, UserRoleName } from "../types/admin.types";

const toRecord = (user: StoredUser): UserRecord => ({
  id: user._id.toString(),
  name: user.name ?? "",
  email: user.email,
  image: user.image ?? "",
  role: user.role ?? "customer",
  createdAt: new Date(user.createdAt).toISOString(),
});

function parseRole(value: unknown): UserRoleName {
  if (typeof value !== "string" || !(USER_ROLES as readonly string[]).includes(value)) {
    throw new ValidationError("Role must be admin, manager or customer");
  }
  return value as UserRoleName;
}

export const userController = {
  async list(): Promise<UserRecord[]> {
    await requireStaff();
    return (await userRepository.list()).map(toRecord);
  },

  async updateRole(id: string, payload: unknown): Promise<void> {
    const session: Session = await requireAdmin();
    const role: UserRoleName = parseRole((payload as { role?: unknown } | null)?.role);
    const user: StoredUser | null = await userRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");
    if (user._id.toString() === session.userId) throw new ForbiddenError("You cannot change your own role");
    if (user.role === "admin" && role !== "admin" && (await userRepository.countByRole("admin")) <= 1) {
      throw new ValidationError("At least one admin is required");
    }
    await userRepository.updateRole(id, role);
  },
};
