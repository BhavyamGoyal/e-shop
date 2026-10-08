import { connectDb } from "../db/connect";
import { CategoryModel, type CategoryDocument } from "../models/category.model";
import { ProductModel } from "../models/product.model";
import type { CategoryFields } from "../types/admin.types";

export type StoredCategory = CategoryDocument & { _id: { toString(): string } };

export const categoryRepository = {
  async list(): Promise<StoredCategory[]> {
    await connectDb();
    return CategoryModel.find().sort({ position: 1, name: 1 }).lean<StoredCategory[]>();
  },

  async listActive(): Promise<StoredCategory[]> {
    await connectDb();
    return CategoryModel.find({ active: true }).sort({ position: 1, name: 1 }).lean<StoredCategory[]>();
  },

  async findById(id: string): Promise<StoredCategory | null> {
    await connectDb();
    return CategoryModel.findById(id).lean<StoredCategory>();
  },

  async findBySlug(slug: string): Promise<StoredCategory | null> {
    await connectDb();
    return CategoryModel.findOne({ slug, active: true }).lean<StoredCategory>();
  },

  async countBySlug(): Promise<Record<string, number>> {
    await connectDb();
    const rows: { _id: string; count: number }[] = await ProductModel.aggregate([
      { $unwind: "$categories" },
      { $group: { _id: "$categories", count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((row) => [row._id, row.count]));
  },

  async updateFields(id: string, fields: Partial<CategoryFields> & { name?: string }): Promise<void> {
    await connectDb();
    await CategoryModel.updateOne({ _id: id }, { $set: fields });
  },
};
