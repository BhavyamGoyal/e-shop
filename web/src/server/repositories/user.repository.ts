import { isValidObjectId } from "mongoose";
import { connectDb } from "../db/connect";
import { UserModel, type UserDocument, type UserRole } from "../models/user.model";

export type StoredUser = UserDocument & { _id: { toString(): string } };

export interface NewUser {
  name: string;
  email: string;
  passwordHash: string;
  image?: string;
  role: UserRole;
}

export const userRepository = {
  async findByEmail(email: string): Promise<StoredUser | null> {
    await connectDb();
    return UserModel.findOne({ email: email.toLowerCase().trim() }).lean<StoredUser>();
  },

  async findById(id: string): Promise<StoredUser | null> {
    await connectDb();
    return isValidObjectId(id) ? UserModel.findById(id).lean<StoredUser>() : null;
  },

  async list(): Promise<StoredUser[]> {
    await connectDb();
    return UserModel.find().sort({ createdAt: -1 }).lean<StoredUser[]>();
  },

  async countByRole(role: UserRole): Promise<number> {
    await connectDb();
    return UserModel.countDocuments({ role });
  },

  async updateRole(id: string, role: UserRole): Promise<boolean> {
    await connectDb();
    return (await UserModel.updateOne({ _id: id }, { $set: { role } })).matchedCount > 0;
  },

  async create(user: NewUser): Promise<StoredUser> {
    await connectDb();
    const created = await UserModel.create(user);
    return created.toObject() as StoredUser;
  },

  async updateProfile(email: string, profile: { name: string; image: string }): Promise<StoredUser | null> {
    await connectDb();
    return UserModel.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $set: profile },
      { returnDocument: "after" },
    ).lean<StoredUser>();
  },
};
