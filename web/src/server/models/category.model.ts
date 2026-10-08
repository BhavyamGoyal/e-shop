import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const seoSchema = new Schema(
  { title: String, description: String, ogImage: String },
  { _id: false },
);

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, default: "" },
    icon: { type: String, default: "" },
    description: { type: String, default: "" },
    position: { type: Number, default: 0, index: true },
    showOnHome: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    seo: seoSchema,
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "categories", versionKey: false },
);

export type CategoryDocument = InferSchemaType<typeof categorySchema>;

export const CategoryModel: Model<CategoryDocument> =
  (models.Category as Model<CategoryDocument> | undefined) ??
  model<CategoryDocument>("Category", categorySchema);
