import { connectDb } from "../db/connect";
import { ProductModel } from "../models/product.model";
import type { TagFields } from "../types/admin.types";
import { TagModel, type TagDocument } from "../models/tag.model";

export type StoredTag = TagDocument & { _id: { toString(): string } };

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const tagRepository = {
  async syncFromProducts(): Promise<void> {
    await connectDb();
    const names: string[] = (await ProductModel.distinct("tags")).filter(
      (name: unknown): name is string => typeof name === "string" && name.trim().length > 0,
    );
    if (!names.length) return;
    await TagModel.bulkWrite(
      names.map((name: string) => ({
        updateOne: { filter: { name }, update: { $setOnInsert: { name, createdAt: new Date() } }, upsert: true },
      })),
      { ordered: false },
    );
  },

  async list(): Promise<StoredTag[]> {
    await connectDb();
    return TagModel.find().sort({ name: 1 }).lean<StoredTag[]>();
  },

  async countByTag(): Promise<Record<string, number>> {
    await connectDb();
    const rows: { _id: string; count: number }[] = await ProductModel.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((row) => [row._id, row.count]));
  },

  async findById(id: string): Promise<StoredTag | null> {
    await connectDb();
    return TagModel.findById(id).lean<StoredTag>();
  },

  async findByName(name: string): Promise<StoredTag | null> {
    await connectDb();
    return TagModel.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, "i") }).lean<StoredTag>();
  },

  async existingNames(names: string[]): Promise<string[]> {
    await connectDb();
    const found: { name: string }[] = await TagModel.find({ name: { $in: names } }, { name: 1 }).lean<{ name: string }[]>();
    const known: Set<string> = new Set(found.map((tag) => tag.name));
    return names.filter((name: string): boolean => known.has(name));
  },

  async create(name: string): Promise<StoredTag> {
    await connectDb();
    const created = await TagModel.create({ name });
    return created.toObject() as StoredTag;
  },

  async rename(id: string, from: string, to: string): Promise<void> {
    await connectDb();
    await TagModel.updateOne({ _id: id }, { $set: { name: to } });
    await ProductModel.updateMany({ tags: from }, { $set: { "tags.$[match]": to } }, { arrayFilters: [{ match: from }] });
  },

  async updateFields(id: string, fields: Partial<TagFields>): Promise<void> {
    await connectDb();
    await TagModel.updateOne({ _id: id }, { $set: fields });
  },

  async listFlagged(): Promise<StoredTag[]> {
    await connectDb();
    return TagModel.find({ $or: [{ header: true }, { collection: true }] })
      .sort({ name: 1 })
      .lean<StoredTag[]>();
  },

  async remove(id: string, name: string): Promise<void> {
    await connectDb();
    await TagModel.deleteOne({ _id: id });
    await ProductModel.updateMany({ tags: name }, { $pull: { tags: name } });
  },

  async setProductTags(productId: string, tags: string[]): Promise<boolean> {
    await connectDb();
    const result = await ProductModel.updateOne({ _id: productId }, { $set: { tags, sourceUpdatedAt: new Date() } });
    return result.matchedCount > 0;
  },
};
