import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    discountAmount: { type: Number, required: true, min: 1, validate: Number.isInteger },
    usageLimit: { type: Number, required: true, min: 1, validate: Number.isInteger },
  },
  { collection: "coupons", versionKey: false, timestamps: true },
);

export type CouponDocument = InferSchemaType<typeof couponSchema>;

export const CouponModel: Model<CouponDocument> =
  (models.Coupon as Model<CouponDocument> | undefined) ?? model<CouponDocument>("Coupon", couponSchema);
