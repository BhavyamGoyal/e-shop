import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100, validate: Number.isInteger },
    maxDiscountAmount: { type: Number, required: true, min: 1, validate: Number.isInteger },
    usageLimit: { type: Number, required: true, min: 1, validate: Number.isInteger },
  },
  { collection: "coupons", versionKey: false, timestamps: true },
);

export type CouponDocument = InferSchemaType<typeof couponSchema>;

export const CouponModel: Model<CouponDocument> =
  (models.Coupon as Model<CouponDocument> | undefined) ?? model<CouponDocument>("Coupon", couponSchema);
