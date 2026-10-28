import { connectDb } from "../db/connect";
import { CustomizerModel, type CustomizerDocument } from "../models/customizer.model";
import { ProductModel } from "../models/product.model";
import type { CustomizerInput } from "../types/customizer.types";

export type StoredCustomizer = CustomizerDocument & { _id: { toString(): string } };

export const customizerRepository = {
  async list(): Promise<StoredCustomizer[]> {
    await connectDb();
    return CustomizerModel.find().sort({ title: 1 }).lean<StoredCustomizer[]>();
  },

  async findBySlug(slug: string): Promise<StoredCustomizer | null> {
    await connectDb();
    return CustomizerModel.findOne({ slug }).lean<StoredCustomizer | null>();
  },

  async findById(id: string): Promise<StoredCustomizer | null> {
    await connectDb();
    return CustomizerModel.findById(id).lean<StoredCustomizer | null>();
  },

  async create(input: CustomizerInput): Promise<void> {
    await connectDb();
    await CustomizerModel.create(input);
  },

  async update(id: string, input: CustomizerInput): Promise<void> {
    await connectDb();
    await CustomizerModel.updateOne({ _id: id }, { $set: input, $inc: { version: 1 } });
  },

  async remove(id: string): Promise<void> {
    await connectDb();
    await CustomizerModel.deleteOne({ _id: id });
  },

  async countProductsUsing(slug: string): Promise<number> {
    await connectDb();
    return ProductModel.countDocuments({ customizerSlug: slug });
  },

  async slugExists(slug: string): Promise<boolean> {
    await connectDb();
    return (await CustomizerModel.exists({ slug })) !== null;
  },
};
