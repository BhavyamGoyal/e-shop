import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    pathname: { type: String, required: true, unique: true },
    filename: { type: String, required: true },
    size: { type: Number, default: 0 },
    contentType: String,
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { collection: "images", versionKey: false },
);

export type ImageDocument = InferSchemaType<typeof imageSchema>;

export const ImageModel: Model<ImageDocument> =
  (models.Image as Model<ImageDocument> | undefined) ?? model<ImageDocument>("Image", imageSchema);
