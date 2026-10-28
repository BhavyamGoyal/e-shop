import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const customizerSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    renderer: { type: String, required: true },
    params: { type: [Schema.Types.Mixed], default: [] },
    active: { type: Boolean, default: true },
    version: { type: Number, default: 1 },
  },
  { collection: "customizers", versionKey: false, timestamps: true },
);

export type CustomizerDocument = InferSchemaType<typeof customizerSchema>;

export const CustomizerModel: Model<CustomizerDocument> =
  (models.Customizer as Model<CustomizerDocument> | undefined) ??
  model<CustomizerDocument>("Customizer", customizerSchema);
