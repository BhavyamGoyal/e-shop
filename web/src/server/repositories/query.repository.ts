import { connectDb } from "../db/connect";
import { QueryModel, type QueryDocument } from "../models/query.model";
import type { StoredQueryInput } from "../types/contact.types";

export type StoredQuery = QueryDocument & { _id: { toString(): string }; user: { name?: string } | null };

export const queryRepository = {
  async list(): Promise<StoredQuery[]> {
    await connectDb();
    return QueryModel.find().sort({ createdAt: -1 }).populate("user", "name").lean<StoredQuery[]>();
  },

  async create(input: StoredQueryInput): Promise<void> {
    await connectDb();
    await QueryModel.create(input);
  },
};
