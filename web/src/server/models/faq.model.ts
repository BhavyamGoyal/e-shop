import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", default: null, index: true },
    position: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    showOnHome: { type: Boolean, default: false },
  },
  { collection: "faqs", versionKey: false, timestamps: true },
);

export type FaqDocument = InferSchemaType<typeof faqSchema>;

export const FaqModel: Model<FaqDocument> =
  (models.Faq as Model<FaqDocument> | undefined) ?? model<FaqDocument>("Faq", faqSchema);
