import mongoose from "mongoose";

const TARGET_SLUG: string = "storage-organizers";
const TARGET_NAME: string = "Storage & Organizers";
const MERGED_SLUGS: string[] = ["desk-organizers", "kitchen-storage"];

async function main(): Promise<void> {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI);
  const categories = mongoose.connection.collection("categories");
  const products = mongoose.connection.collection("products");

  const keeper = await categories.findOne({ slug: "desk-organizers" });
  if (keeper) {
    await categories.updateOne({ _id: keeper._id }, { $set: { name: TARGET_NAME, slug: TARGET_SLUG } });
  }
  const removed = await categories.deleteMany({ slug: "kitchen-storage" });
  console.log(`category kept: ${keeper ? 1 : 0}, removed: ${removed.deletedCount}`);

  const docs = await products.find({ categories: { $in: MERGED_SLUGS } }).toArray();
  for (const doc of docs) {
    const current: string[] = doc.categories as string[];
    const next: string[] = [...new Set(current.map((slug: string): string => (MERGED_SLUGS.includes(slug) ? TARGET_SLUG : slug)))];
    await products.updateOne({ _id: doc._id }, { $set: { categories: next } });
  }
  console.log(`products updated: ${docs.length}`);
  await mongoose.disconnect();
}

main().catch((error: unknown): void => {
  console.error(error);
  process.exit(1);
});
