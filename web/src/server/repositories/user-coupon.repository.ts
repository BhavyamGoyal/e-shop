import { connectDb } from "../db/connect";
import { UserCouponModel, type UserCouponDocument } from "../models/user-coupon.model";

export type StoredUserCoupon = UserCouponDocument & { _id: unknown };

export const userCouponRepository = {
  async assign(userId: string, couponId: string, uses: number): Promise<void> {
    await connectDb();
    await UserCouponModel.updateOne({ userId, couponId }, { $set: { usesRemaining: uses } }, { upsert: true });
  },

  async find(userId: string, couponId: string): Promise<StoredUserCoupon | null> {
    await connectDb();
    return UserCouponModel.findOne({ userId, couponId }).lean<StoredUserCoupon>();
  },

  async listUsable(userId: string): Promise<StoredUserCoupon[]> {
    await connectDb();
    return UserCouponModel.find({ userId, usesRemaining: { $gt: 0 } })
      .sort({ updatedAt: -1 })
      .lean<StoredUserCoupon[]>();
  },

  async countByCoupon(): Promise<Record<string, number>> {
    await connectDb();
    const rows: { _id: string; count: number }[] = await UserCouponModel.aggregate([
      { $group: { _id: "$couponId", count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((row) => [row._id, row.count]));
  },

  async consume(userId: string, couponId: string): Promise<boolean> {
    await connectDb();
    const result = await UserCouponModel.updateOne(
      { userId, couponId, usesRemaining: { $gt: 0 } },
      { $inc: { usesRemaining: -1 } },
    );
    return result.modifiedCount > 0;
  },

  async removeByCoupon(couponId: string): Promise<void> {
    await connectDb();
    await UserCouponModel.deleteMany({ couponId });
  },
};
