import mongoose from "mongoose";
import { CATEGORIES } from "./data/categories";

async function main(): Promise<void> {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI);
  const categories = mongoose.connection.collection("categories");
  const products = mongoose.connection.collection("products");
  await categories.createIndex({ slug: 1 }, { unique: true });
  await categories.createIndex({ name: 1 }, { unique: true });
  const now: Date = new Date();
  for (const [index, category] of CATEGORIES.entries()) {
    const result = await categories.updateOne(
      { slug: category.slug },
      {
        $setOnInsert: {
          name: category.name,
          slug: category.slug,
          image: "",
          icon: "",
          description: "",
          position: index,
          showOnHome: true,
          active: true,
          createdAt: now,
        },
      },
      { upsert: true },
    );
    console.log(`${result.upsertedCount ? "created" : "kept   "} ${category.slug}`);
  }
  await products.createIndex({ categories: 1 });
  const backfill = await products.updateMany({ categories: { $exists: false } }, { $set: { categories: [] } });
  console.log(`products backfilled: ${backfill.modifiedCount}`);
  await mongoose.disconnect();
}

main().catch((error: unknown): void => {
  console.error(error);
  process.exit(1);
});
