import mongoose from "mongoose";
import { PAGES } from "./data/pages";

async function main(): Promise<void> {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI);
  const pages = mongoose.connection.collection("pages");
  await pages.createIndex({ url: 1 }, { unique: true });
  const now: Date = new Date();
  for (const page of PAGES) {
    const result = await pages.updateOne(
      { url: page.url },
      { $setOnInsert: { url: page.url, content: page.content, createdAt: now, updatedAt: now } },
      { upsert: true },
    );
    console.log(`${result.upsertedCount ? "created" : "kept   "} /${page.url}`);
  }
  await mongoose.disconnect();
}

main().catch((error: unknown): void => {
  console.error(error);
  process.exit(1);
});
