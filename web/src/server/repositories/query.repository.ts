import { connectDb } from "../db/connect";
import { QueryModel } from "../models/query.model";
import type { StoredQueryInput } from "../types/contact.types";

export const queryRepository = {
  async create(input: StoredQueryInput): Promise<void> {
    await connectDb();
    await QueryModel.create(input);
  },
};
