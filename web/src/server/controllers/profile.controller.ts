import { requireCustomer } from "../auth/guard";
import { NotFoundError, ValidationError } from "../http/errors";
import { userRepository, type StoredUser } from "../repositories/user.repository";
import { toProfile, type Profile } from "../services/auth.service";

const MAX_NAME_LENGTH = 80;

function parseName(payload: unknown): string {
  const name: unknown = (payload as { name?: unknown } | null)?.name;
  if (typeof name !== "string" || !name.trim()) throw new ValidationError("Enter your name");
  if (name.trim().length > MAX_NAME_LENGTH) throw new ValidationError(`Name can be up to ${MAX_NAME_LENGTH} characters`);
  return name.trim();
}

export const profileController = {
  async update(payload: unknown): Promise<Profile> {
    const user: StoredUser = await requireCustomer();
    const name: string = parseName(payload);
    const updated: StoredUser | null = await userRepository.updateProfile(user.email, { name, image: user.image ?? "" });
    if (!updated) throw new NotFoundError("Account not found");
    return toProfile(updated);
  },
};
