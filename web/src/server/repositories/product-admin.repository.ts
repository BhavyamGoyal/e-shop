import type { FilterQuery, SortOrder } from "mongoose";
import { connectDb } from "../db/connect";
import { ProductModel, type ProductDocument } from "../models/product.model";
import type { ProductListQuery } from "../types/admin.types";

export type AdminProduct = ProductDocument & { _id: { toString(): string } };

export interface AdminProductPage {
  items: AdminProduct[];
  total: number;
}

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SORT_FIELDS: Record<string, string> = {
  title: "title",
  price: "price",
  productType: "productType",
  available: "available",
};

function buildFilter(query: ProductListQuery): FilterQuery<ProductDocument> {
  const clauses: FilterQuery<ProductDocument>[] = [];
  if (query.title) clauses.push({ $or: [{ title: new RegExp(escapeRegex(query.title), "i") }, { handle: new RegExp(escapeRegex(query.title), "i") }] });
  if (query.productType) clauses.push({ productType: new RegExp(escapeRegex(query.productType), "i") });
  if (query.available !== null) clauses.push({ available: query.available });
  return clauses.length ? { $and: clauses } : {};
}

function buildSort(query: ProductListQuery): Record<string, SortOrder> {
  const field: string | undefined = query.sortKey ? SORT_FIELDS[query.sortKey] : undefined;
  if (!field) return { publishedAt: -1, handle: 1 };
  return { [field]: query.sortDir === "desc" ? -1 : 1, handle: 1 };
}

const LIST_PROJECTION = {
  title: 1,
  handle: 1,
  price: 1,
  available: 1,
  productType: 1,
  images: { $slice: 1 },
};

export const productAdminRepository = {
  async list(query: ProductListQuery): Promise<AdminProductPage> {
    await connectDb();
    const filter: FilterQuery<ProductDocument> = buildFilter(query);
    const [items, total] = await Promise.all([
      ProductModel.find(filter, LIST_PROJECTION)
        .sort(buildSort(query))
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean<AdminProduct[]>(),
      ProductModel.countDocuments(filter),
    ]);
    return { items, total };
  },

  async findById(id: string): Promise<AdminProduct | null> {
    await connectDb();
    return ProductModel.findById(id).lean<AdminProduct>();
  },

  async handleTaken(handle: string, exceptId: string | null): Promise<boolean> {
    await connectDb();
    const found = await ProductModel.findOne({ handle }, { _id: 1 }).lean<{ _id: { toString(): string } }>();
    return Boolean(found) && found?._id.toString() !== exceptId;
  },

  async create(fields: Record<string, unknown>): Promise<AdminProduct> {
    await connectDb();
    const now: Date = new Date();
    const created = await ProductModel.create({
      ...fields,
      sourceId: Date.now(),
      currency: "INR",
      publishedAt: now,
      sourceCreatedAt: now,
      sourceUpdatedAt: now,
    });
    return created.toObject() as AdminProduct;
  },

  async update(id: string, fields: Record<string, unknown>): Promise<AdminProduct | null> {
    await connectDb();
    return ProductModel.findByIdAndUpdate(
      id,
      { $set: { ...fields, sourceUpdatedAt: new Date() } },
      { new: true },
    ).lean<AdminProduct>();
  },

  async remove(id: string): Promise<AdminProduct | null> {
    await connectDb();
    return ProductModel.findByIdAndDelete(id).lean<AdminProduct>();
  },
};
