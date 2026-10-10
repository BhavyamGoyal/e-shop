import type { FilterQuery, SortOrder } from "mongoose";
import { connectDb } from "../db/connect";
import { ACTIVE_PRODUCT, ProductModel, type ProductDocument } from "../models/product.model";
import type { CatalogFacets, FacetValue, ProductQuery, SortOption } from "../types/product.types";

export interface ProductSearchResult {
  items: ProductDocument[];
  total: number;
}

export interface ProductSitemapEntry {
  handle: string;
  lastModified: Date | null;
}

export interface CollectionStat {
  handle: string;
  count: number;
  images: string[];
}

const SORTS: Record<SortOption, Record<string, SortOrder>> = {
  newest: { publishedAt: -1, handle: 1 },
  oldest: { publishedAt: 1, handle: 1 },
  "price-asc": { price: 1, handle: 1 },
  "price-desc": { price: -1, handle: 1 },
  "title-asc": { title: 1, handle: 1 },
  "title-desc": { title: -1, handle: 1 },
};

const SUMMARY_PROJECTION = {
  sourceId: 1,
  handle: 1,
  title: 1,
  price: 1,
  priceMax: 1,
  compareAtPrice: 1,
  available: 1,
  productType: 1,
  tags: 1,
  collections: 1,
  images: { $slice: 2 },
  videos: { $slice: 1 },
};

const FACET_TAG_LIMIT = 24;

interface FacetCount {
  _id: string;
  count: number;
}

interface FacetRow {
  types: FacetCount[];
  tags: FacetCount[];
  price: { min: number; max: number }[];
}

const toFacetValues = (rows: FacetCount[]): FacetValue[] =>
  rows.map((row: FacetCount): FacetValue => ({ value: row._id, count: row.count }));

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function buildFilter(query: ProductQuery): FilterQuery<ProductDocument> {
  const clauses: FilterQuery<ProductDocument>[] = [ACTIVE_PRODUCT];

  if (query.q) {
    const pattern: RegExp = new RegExp(escapeRegex(query.q), "i");
    clauses.push({
      $or: [
        { title: pattern },
        { tags: pattern },
        { productType: pattern },
        { collections: pattern },
        { descriptionText: pattern },
      ],
    });
  }
  if (query.collections.length) clauses.push({ collections: { $in: query.collections } });
  if (query.categories.length) clauses.push({ categories: { $in: query.categories } });
  if (query.tags.length) clauses.push({ tags: { $in: query.tags } });
  if (query.productTypes.length) clauses.push({ productType: { $in: query.productTypes } });
  if (query.minPrice !== undefined) clauses.push({ price: { $gte: query.minPrice } });
  if (query.maxPrice !== undefined) clauses.push({ price: { $lte: query.maxPrice } });
  if (query.available !== undefined) clauses.push({ available: query.available });
  if (query.onSale) clauses.push({ $expr: { $gt: ["$compareAtPrice", "$price"] } });
  if (query.hasVideo !== undefined) {
    clauses.push({ "videos.0": { $exists: query.hasVideo } });
  }

  return { $and: clauses };
}

export const productRepository = {
  async search(query: ProductQuery): Promise<ProductSearchResult> {
    await connectDb();
    const filter: FilterQuery<ProductDocument> = buildFilter(query);
    const [items, total] = await Promise.all([
      ProductModel.find(filter, SUMMARY_PROJECTION)
        .sort(SORTS[query.sort])
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean<ProductDocument[]>(),
      ProductModel.countDocuments(filter),
    ]);
    return { items, total };
  },

  async findByHandle(handle: string): Promise<ProductDocument | null> {
    await connectDb();
    return ProductModel.findOne({ handle, ...ACTIVE_PRODUCT }).lean<ProductDocument>();
  },

  async sitemapEntries(): Promise<ProductSitemapEntry[]> {
    await connectDb();
    const rows: { handle: string; sourceUpdatedAt?: Date | null; publishedAt?: Date | null }[] =
      await ProductModel.find(ACTIVE_PRODUCT, { handle: 1, sourceUpdatedAt: 1, publishedAt: 1 })
        .sort({ handle: 1 })
        .lean<{ handle: string; sourceUpdatedAt?: Date | null; publishedAt?: Date | null }[]>();
    return rows.map(
      (row): ProductSitemapEntry => ({
        handle: row.handle,
        lastModified: row.sourceUpdatedAt ?? row.publishedAt ?? null,
      }),
    );
  },

  async facets(collections: string[]): Promise<CatalogFacets> {
    await connectDb();
    const match: FilterQuery<ProductDocument> = collections.length
      ? { ...ACTIVE_PRODUCT, collections: { $in: collections } }
      : ACTIVE_PRODUCT;
    const [row]: FacetRow[] = await ProductModel.aggregate([
      { $match: match },
      {
        $facet: {
          types: [
            { $match: { productType: { $nin: [null, ""] } } },
            { $group: { _id: "$productType", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
          ],
          tags: [
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: FACET_TAG_LIMIT },
          ],
          price: [{ $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } }],
        },
      },
    ]);
    return {
      productTypes: toFacetValues(row?.types ?? []),
      tags: toFacetValues(row?.tags ?? []),
      minPrice: Math.floor(row?.price[0]?.min ?? 0),
      maxPrice: Math.ceil(row?.price[0]?.max ?? 0),
    };
  },

  async collectionStats(): Promise<CollectionStat[]> {
    await connectDb();
    const rows: { _id: string; count: number; images: string[] }[] = await ProductModel.aggregate([
      { $match: { ...ACTIVE_PRODUCT, "images.0": { $exists: true } } },
      { $sort: { publishedAt: -1 } },
      { $unwind: "$collections" },
      {
        $group: {
          _id: "$collections",
          count: { $sum: 1 },
          images: { $push: { $arrayElemAt: ["$images.url", 0] } },
        },
      },
      { $sort: { count: 1, _id: 1 } },
    ]);
    return rows.map((row): CollectionStat => ({ handle: row._id, count: row.count, images: row.images }));
  },
};

export type ProductRepository = typeof productRepository;
