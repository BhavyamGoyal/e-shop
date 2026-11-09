import mongoose from "mongoose";
import { CUSTOMIZERS } from "./data/customizers";

const REFRESH_SLUGS: string[] = ["letter-name"];

async function main(): Promise<void> {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI);
  const customizers = mongoose.connection.collection("customizers");
  await customizers.createIndex({ slug: 1 }, { unique: true });
  const now: Date = new Date();
  for (const customizer of CUSTOMIZERS) {
    const refresh: boolean = REFRESH_SLUGS.includes(customizer.slug);
    const result = await customizers.updateOne(
      { slug: customizer.slug },
      refresh
        ? { $set: { ...customizer, updatedAt: now }, $inc: { version: 1 }, $setOnInsert: { createdAt: now } }
        : { $setOnInsert: { ...customizer, version: 1, createdAt: now, updatedAt: now } },
      { upsert: true },
    );
    const state: string = result.upsertedCount ? "created" : refresh ? "updated" : "kept   ";
    console.log(`${state} ${customizer.slug}`);
  }
  await mongoose.disconnect();
}

main().catch((error: unknown): void => {
  console.error(error);
  process.exit(1);
});
