import { connectDb } from "../db/connect";
import { WishlistModel, type WishlistDocument } from "../models/wishlist.model";
import type { WishlistItemRecord } from "../types/wishlist.types";

export type StoredWishlist = WishlistDocument;

export const wishlistRepository = {
  async save(userId: string, items: WishlistItemRecord[]): Promise<void> {
    await connectDb();
    await WishlistModel.updateOne({ userId }, { $set: { items, updatedAt: new Date() } }, { upsert: true });
  },

  async findByUserId(userId: string): Promise<StoredWishlist | null> {
    await connectDb();
    return WishlistModel.findOne({ userId }).lean<StoredWishlist>();
  },
};
