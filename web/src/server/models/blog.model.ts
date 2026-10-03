import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: "" },
    bodyHtml: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
  },
  { collection: "blogs", versionKey: false, timestamps: true },
);

blogSchema.index({ published: 1, publishedAt: -1 });

export type BlogDocument = InferSchemaType<typeof blogSchema>;

export const BlogModel: Model<BlogDocument> =
  (models.Blog as Model<BlogDocument> | undefined) ?? model<BlogDocument>("Blog", blogSchema);
