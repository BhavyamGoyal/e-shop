import { connectDb } from "../db/connect";
import { PageModel, type PageDocument } from "../models/page.model";
import type { PageInput } from "../types/content.types";

export type StoredPage = PageDocument & { _id: { toString(): string }; createdAt: Date; updatedAt: Date };

export const pageRepository = {
  async list(): Promise<StoredPage[]> {
    await connectDb();
    return PageModel.find().sort({ url: 1 }).lean<StoredPage[]>();
  },

  async findById(id: string): Promise<StoredPage | null> {
    await connectDb();
    return PageModel.findById(id).lean<StoredPage>();
  },

  async findByUrl(url: string): Promise<StoredPage | null> {
    await connectDb();
    return PageModel.findOne({ url }).lean<StoredPage>();
  },

  async findIdByUrl(url: string): Promise<string | null> {
    await connectDb();
    const found = await PageModel.findOne({ url }, { _id: 1 }).lean<{ _id: { toString(): string } }>();
    return found ? found._id.toString() : null;
  },

  async exists(id: string): Promise<boolean> {
    await connectDb();
    return (await PageModel.exists({ _id: id })) !== null;
  },

  async create(input: PageInput): Promise<void> {
    await connectDb();
    await PageModel.create(input);
  },

  async update(id: string, input: PageInput): Promise<void> {
    await connectDb();
    await PageModel.updateOne({ _id: id }, { $set: input });
  },

  async remove(id: string): Promise<void> {
    await connectDb();
    await PageModel.deleteOne({ _id: id });
  },
};
