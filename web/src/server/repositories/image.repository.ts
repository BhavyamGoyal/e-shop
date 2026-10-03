import { connectDb } from "../db/connect";
import { ImageModel, type ImageDocument } from "../models/image.model";

export type StoredImage = ImageDocument & { _id: { toString(): string } };

export interface NewImage {
  url: string;
  pathname: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface ImagePage {
  items: StoredImage[];
  total: number;
}

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const imageRepository = {
  async list(page: number, limit: number, search: string): Promise<ImagePage> {
    await connectDb();
    const filter = search ? { filename: new RegExp(escapeRegex(search), "i") } : {};
    const [items, total] = await Promise.all([
      ImageModel.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<StoredImage[]>(),
      ImageModel.countDocuments(filter),
    ]);
    return { items, total };
  },

  async create(image: NewImage): Promise<StoredImage> {
    await connectDb();
    const saved = await ImageModel.findOneAndUpdate(
      { pathname: image.pathname },
      { $set: image, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true },
    ).lean<StoredImage>();
    return saved as StoredImage;
  },

  async findById(id: string): Promise<StoredImage | null> {
    await connectDb();
    return ImageModel.findById(id).lean<StoredImage>();
  },

  async remove(id: string): Promise<void> {
    await connectDb();
    await ImageModel.deleteOne({ _id: id });
  },
};
