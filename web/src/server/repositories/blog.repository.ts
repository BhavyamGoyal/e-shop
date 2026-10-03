import { connectDb } from "../db/connect";
import { BlogModel, type BlogDocument } from "../models/blog.model";
import { FaqModel } from "../models/faq.model";
import type { BlogInput, BlogSitemapEntry } from "../types/content.types";

export type StoredBlog = BlogDocument & { _id: { toString(): string }; createdAt: Date; updatedAt: Date };

interface SitemapRow {
  slug: string;
  updatedAt?: Date;
}

export const blogRepository = {
  async list(): Promise<StoredBlog[]> {
    await connectDb();
    return BlogModel.find().sort({ updatedAt: -1 }).lean<StoredBlog[]>();
  },

  async listPublished(): Promise<StoredBlog[]> {
    await connectDb();
    return BlogModel.find({ published: true }).sort({ publishedAt: -1 }).lean<StoredBlog[]>();
  },

  async sitemapEntries(): Promise<BlogSitemapEntry[]> {
    await connectDb();
    const rows: SitemapRow[] = await BlogModel.find({ published: true }, { slug: 1, updatedAt: 1 }).lean<SitemapRow[]>();
    return rows.map((row: SitemapRow): BlogSitemapEntry => ({ slug: row.slug, lastModified: row.updatedAt ?? null }));
  },

  async findById(id: string): Promise<StoredBlog | null> {
    await connectDb();
    return BlogModel.findById(id).lean<StoredBlog>();
  },

  async findBySlug(slug: string): Promise<StoredBlog | null> {
    await connectDb();
    return BlogModel.findOne({ slug }).lean<StoredBlog>();
  },

  async findPublishedBySlug(slug: string): Promise<StoredBlog | null> {
    await connectDb();
    return BlogModel.findOne({ slug, published: true }).lean<StoredBlog>();
  },

  async create(input: BlogInput, publishedAt: Date | null): Promise<StoredBlog> {
    await connectDb();
    const created = await BlogModel.create({ ...input, publishedAt });
    return created.toObject() as StoredBlog;
  },

  async update(id: string, input: BlogInput, publishedAt: Date | null): Promise<void> {
    await connectDb();
    await BlogModel.updateOne({ _id: id }, { $set: { ...input, publishedAt } });
  },

  async remove(id: string): Promise<void> {
    await connectDb();
    await BlogModel.deleteOne({ _id: id });
    await FaqModel.updateMany({ blogId: id }, { $set: { blogId: null } });
  },
};
