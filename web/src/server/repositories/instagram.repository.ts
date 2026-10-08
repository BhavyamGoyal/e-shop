import type { AnyBulkWriteOperation } from "mongoose";
import { connectDb } from "../db/connect";
import { InsightModel, type InsightDocument } from "../models/instagram-insight.model";
import type { InsightInput, InsightKind } from "../types/instagram.types";

export type StoredInsight = InsightDocument & { _id: { toString(): string } };

const SORT_BY_KIND: Record<InsightKind, 1 | -1> = { account: 1, post: -1, audience: -1 };

const toUpsert = (input: InsightInput): AnyBulkWriteOperation<InsightDocument> => ({
  updateOne: { filter: { kind: input.kind, key: input.key }, update: { $set: input }, upsert: true },
});

export const instagramRepository = {
  async listByKind(kind: InsightKind): Promise<StoredInsight[]> {
    await connectDb();
    return InsightModel.find({ kind }).sort({ date: SORT_BY_KIND[kind] }).lean<StoredInsight[]>();
  },

  async save(kind: InsightKind, inputs: InsightInput[]): Promise<void> {
    await connectDb();
    if (kind === "audience") await InsightModel.deleteMany({ kind });
    await InsightModel.bulkWrite(inputs.map(toUpsert));
  },
};
