import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const tagSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "tags", versionKey: false },
);

export type TagDocument = InferSchemaType<typeof tagSchema>;

export const TagModel: Model<TagDocument> =
  (models.Tag as Model<TagDocument> | undefined) ?? model<TagDocument>("Tag", tagSchema);
