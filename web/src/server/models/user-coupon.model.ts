import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const userCouponSchema = new Schema(
  {
    userId: { type: String, required: true },
    couponId: { type: String, required: true },
    usesRemaining: { type: Number, required: true, min: 0, validate: Number.isInteger },
  },
  { collection: "usercoupons", versionKey: false, timestamps: true },
);

userCouponSchema.index({ userId: 1, couponId: 1 }, { unique: true });
userCouponSchema.index({ couponId: 1 });

export type UserCouponDocument = InferSchemaType<typeof userCouponSchema>;

export const UserCouponModel: Model<UserCouponDocument> =
  (models.UserCoupon as Model<UserCouponDocument> | undefined) ??
  model<UserCouponDocument>("UserCoupon", userCouponSchema);
