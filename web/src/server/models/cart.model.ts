import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const lineSchema = new Schema(
  {
    key: { type: String, required: true },
    handle: { type: String, required: true },
    title: { type: String, required: true },
    variantTitle: { type: String, default: null },
    image: { type: String, default: null },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: null },
    quantity: { type: Number, required: true },
  },
  { _id: false },
);

const cartSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String, default: "" },
    items: { type: [lineSchema], default: [] },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "carts", versionKey: false },
);

export type CartDocument = InferSchemaType<typeof cartSchema>;

export const CartModel: Model<CartDocument> =
  (models.Cart as Model<CartDocument> | undefined) ?? model<CartDocument>("Cart", cartSchema);
