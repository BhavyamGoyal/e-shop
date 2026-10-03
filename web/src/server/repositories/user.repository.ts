import { connectDb } from "../db/connect";
import { UserModel, type UserDocument, type UserRole } from "../models/user.model";

export type StoredUser = UserDocument & { _id: { toString(): string } };

export interface NewUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export const userRepository = {
  async findByEmail(email: string): Promise<StoredUser | null> {
    await connectDb();
    return UserModel.findOne({ email: email.toLowerCase().trim() }).lean<StoredUser>();
  },

  async create(user: NewUser): Promise<StoredUser> {
    await connectDb();
    const created = await UserModel.create(user);
    return created.toObject() as StoredUser;
  },
};
