import { connectDb } from "../db/connect";
import { FaqModel, type FaqDocument } from "../models/faq.model";
import type { FaqInput } from "../types/content.types";

export type StoredFaq = FaqDocument & { _id: { toString(): string } };

const ORDER = { position: 1, createdAt: 1 } as const;

export const faqRepository = {
  async list(): Promise<StoredFaq[]> {
    await connectDb();
    return FaqModel.find().sort(ORDER).lean<StoredFaq[]>();
  },

  async listPublishedForBlog(blogId: string): Promise<StoredFaq[]> {
    await connectDb();
    return FaqModel.find({ blogId, published: true }).sort(ORDER).lean<StoredFaq[]>();
  },

  async listPublishedGeneral(): Promise<StoredFaq[]> {
    await connectDb();
    return FaqModel.find({ blogId: null, published: true }).sort(ORDER).lean<StoredFaq[]>();
  },

  async listPublishedForHome(): Promise<StoredFaq[]> {
    await connectDb();
    return FaqModel.find({ showOnHome: true, published: true }).sort(ORDER).lean<StoredFaq[]>();
  },

  async countByBlog(): Promise<Record<string, number>> {
    await connectDb();
    const rows: { _id: { toString(): string }; count: number }[] = await FaqModel.aggregate([
      { $match: { blogId: { $ne: null } } },
      { $group: { _id: "$blogId", count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((row) => [row._id.toString(), row.count]));
  },

  async exists(id: string): Promise<boolean> {
    await connectDb();
    return (await FaqModel.exists({ _id: id })) !== null;
  },

  async create(input: FaqInput): Promise<StoredFaq> {
    await connectDb();
    const created = await FaqModel.create(input);
    return created.toObject() as StoredFaq;
  },

  async update(id: string, input: FaqInput): Promise<void> {
    await connectDb();
    await FaqModel.updateOne({ _id: id }, { $set: input });
  },

  async remove(id: string): Promise<void> {
    await connectDb();
    await FaqModel.deleteOne({ _id: id });
  },
};
