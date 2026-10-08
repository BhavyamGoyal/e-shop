import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const count = { type: Number, default: 0 } as const;
const text = { type: String, default: "" } as const;

const insightSchema = new Schema(
  {
    kind: { type: String, enum: ["account", "post", "audience"], required: true },
    key: { type: String, required: true },
    date: { type: Date, required: true },
    source: { type: String, enum: ["upload", "api"], default: "upload" },
    followers: count,
    reach: count,
    views: count,
    profileViews: count,
    websiteClicks: count,
    likes: count,
    comments: count,
    saves: count,
    shares: count,
    caption: text,
    permalink: text,
    mediaType: text,
    dimension: text,
    label: text,
    value: count,
  },
  { collection: "instagram_insights", versionKey: false, timestamps: true },
);

insightSchema.index({ kind: 1, key: 1 }, { unique: true });
insightSchema.index({ kind: 1, date: -1 });

export type InsightDocument = InferSchemaType<typeof insightSchema>;

export const InsightModel: Model<InsightDocument> =
  (models.InstagramInsight as Model<InsightDocument> | undefined) ??
  model<InsightDocument>("InstagramInsight", insightSchema);
