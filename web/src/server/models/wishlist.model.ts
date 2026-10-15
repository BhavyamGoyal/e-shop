import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const itemSchema = new Schema(
  {
    handle: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, default: null },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: null },
  },
  { _id: false },
);

const wishlistSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: { type: [itemSchema], default: [] },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "wishlisted", versionKey: false },
);

export type WishlistDocument = InferSchemaType<typeof wishlistSchema>;

export const WishlistModel: Model<WishlistDocument> =
  (models.Wishlist as Model<WishlistDocument> | undefined) ?? model<WishlistDocument>("Wishlist", wishlistSchema);
