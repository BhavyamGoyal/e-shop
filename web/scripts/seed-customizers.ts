import mongoose from "mongoose";
import { CUSTOMIZERS } from "./data/customizers";

const UPDATE_FLAG = "--update";

async function main(): Promise<void> {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  const update: boolean = process.argv.includes(UPDATE_FLAG);
  await mongoose.connect(process.env.MONGODB_URI);
  const customizers = mongoose.connection.collection("customizers");
  await customizers.createIndex({ slug: 1 }, { unique: true });
  const now: Date = new Date();
  for (const customizer of CUSTOMIZERS) {
    const result = await customizers.updateOne(
      { slug: customizer.slug },
      update
        ? { $set: { ...customizer, updatedAt: now }, $inc: { version: 1 }, $setOnInsert: { createdAt: now } }
        : { $setOnInsert: { ...customizer, version: 1, createdAt: now, updatedAt: now } },
      { upsert: true },
    );
    const state: string = result.upsertedCount ? "created" : update ? "updated" : "kept   ";
    console.log(`${state} ${customizer.slug}`);
  }
  await mongoose.disconnect();
}

main().catch((error: unknown): void => {
  console.error(error);
  process.exit(1);
});
