import { connectDb } from "../db/connect";
import { CartModel, type CartDocument } from "../models/cart.model";
import type { CartLineRecord } from "../types/cart.types";

export type StoredCart = CartDocument;

export const cartRepository = {
  async save(userId: string, email: string, name: string, items: CartLineRecord[]): Promise<void> {
    await connectDb();
    await CartModel.updateOne(
      { userId },
      { $set: { email, name, items, updatedAt: new Date() } },
      { upsert: true },
    );
  },

  async listNonEmpty(): Promise<StoredCart[]> {
    await connectDb();
    return CartModel.find({ "items.0": { $exists: true } })
      .sort({ updatedAt: -1 })
      .lean<StoredCart[]>();
  },

  async findByUserId(userId: string): Promise<StoredCart | null> {
    await connectDb();
    return CartModel.findOne({ userId }).lean<StoredCart>();
  },
};
