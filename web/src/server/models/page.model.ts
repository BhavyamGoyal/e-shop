import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const pageSchema = new Schema(
  {
    url: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
  },
  { collection: "pages", versionKey: false, timestamps: true },
);

export type PageDocument = InferSchemaType<typeof pageSchema>;

export const PageModel: Model<PageDocument> =
  (models.Page as Model<PageDocument> | undefined) ?? model<PageDocument>("Page", pageSchema);
