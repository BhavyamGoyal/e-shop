import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";
import { pointSchema } from "./address.model";
import { INVOICE_ENTRY_TYPES, ORDER_STATUSES } from "../types/order.types";

const lineSchema = new Schema(
  {
    key: { type: String, required: true },
    handle: { type: String, required: true },
    variantId: { type: Number, default: null },
    title: { type: String, required: true },
    variantTitle: { type: String, default: null },
    image: { type: String, default: null },
    unitAmount: { type: Number, required: true, min: 0, validate: Number.isInteger },
    quantity: { type: Number, required: true, min: 1, max: 99, validate: Number.isInteger },
    customization: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false },
);

const shippingSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    landmark: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "IN" },
    location: { type: pointSchema, default: undefined },
  },
  { _id: false },
);

const deliverySchema = new Schema(
  {
    partnerId: { type: String, required: true },
    manufacturingDays: { type: Number, required: true, min: 0, validate: Number.isInteger },
    transitDays: { type: Number, required: true, min: 0, validate: Number.isInteger },
    estimatedDate: { type: String, required: true },
  },
  { _id: false },
);

const invoiceEntrySchema = new Schema(
  {
    type: { type: String, enum: INVOICE_ENTRY_TYPES, required: true },
    code: { type: String, required: true },
    label: { type: String, required: true },
    amount: { type: Number, required: true, min: 0, validate: Number.isInteger },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    isLoggedOutOrder: { type: Boolean, default: false },
    items: { type: [lineSchema], required: true },
    shippingAddress: { type: shippingSchema, required: true },
    subtotal: { type: Number, required: true, min: 0, validate: Number.isInteger },
    discount: { type: Number, default: 0, min: 0, validate: Number.isInteger },
    couponId: { type: String, default: null },
    couponCode: { type: String, default: null },
    deliveryCharge: { type: Number, default: 0, min: 0, validate: Number.isInteger },
    delivery: { type: deliverySchema, default: undefined },
    invoiceData: { type: [invoiceEntrySchema], default: [] },
    total: { type: Number, required: true, min: 0, validate: Number.isInteger },
    tinglePointsUsed: { type: Number, default: 0, min: 0, validate: Number.isInteger },
    tinglePointsEarned: { type: Number, default: 0, min: 0, validate: Number.isInteger },
    currency: { type: String, required: true, default: "INR" },
    status: { type: String, enum: ORDER_STATUSES, default: "pending", required: true },
    paidAt: { type: Date, default: null },
  },
  { collection: "orders", versionKey: false, timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ userId: 1, couponId: 1, status: 1, createdAt: -1 });

export type OrderDocument = InferSchemaType<typeof orderSchema>;

export const OrderModel: Model<OrderDocument> =
  (models.Order as Model<OrderDocument> | undefined) ?? model<OrderDocument>("Order", orderSchema);
