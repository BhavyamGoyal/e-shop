import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const querySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    message: { type: String, required: true },
  },
  { collection: "queries", versionKey: false, timestamps: true },
);

export type QueryDocument = InferSchemaType<typeof querySchema>;

export const QueryModel: Model<QueryDocument> =
  (models.Query as Model<QueryDocument> | undefined) ?? model<QueryDocument>("Query", querySchema);
