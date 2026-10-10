import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";
import { PAYMENT_STATUSES } from "../types/order.types";

const paymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    orderNumber: { type: String, required: true },
    userId: { type: String, required: true },
    provider: { type: String, required: true, default: "razorpay" },
    providerOrderId: { type: String, required: true, unique: true },
    providerPaymentId: { type: String, unique: true, sparse: true, default: undefined },
    amount: { type: Number, required: true, min: 100, validate: Number.isInteger },
    currency: { type: String, required: true, default: "INR" },
    status: { type: String, enum: PAYMENT_STATUSES, default: "created", required: true },
    method: { type: String, default: null },
    failureReason: { type: String, default: null },
    signatureVerified: { type: Boolean, default: false },
    capturedAt: { type: Date, default: null },
  },
  { collection: "payments", versionKey: false, timestamps: true },
);

paymentSchema.index({ userId: 1, createdAt: -1 });

export type PaymentDocument = InferSchemaType<typeof paymentSchema>;

export const PaymentModel: Model<PaymentDocument> =
  (models.Payment as Model<PaymentDocument> | undefined) ?? model<PaymentDocument>("Payment", paymentSchema);
