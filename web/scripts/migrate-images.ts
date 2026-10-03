import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import mongoose from "mongoose";

interface LocalImage {
  folder: string;
  filename: string;
  file: string;
  localUrl: string;
  pathname: string;
}

interface ImageRow {
  url: string;
  pathname: string;
  filename: string;
  size: number;
  contentType: string;
  createdAt: Date;
}

const ROOT: string = path.resolve("public", "products");
const CONCURRENCY = 6;
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

async function scan(): Promise<LocalImage[]> {
  const found: LocalImage[] = [];
  for (const folder of await readdir(ROOT)) {
    const dir: string = path.join(ROOT, folder, "images");
    let names: string[];
    try {
      names = await readdir(dir);
    } catch {
      continue;
    }
    for (const filename of names) {
      if (!MIME[path.extname(filename).toLowerCase()]) continue;
      found.push({
        folder,
        filename,
        file: path.join(dir, filename),
        localUrl: `/products/${folder}/images/${filename}`,
        pathname: `products/${folder}/${filename}`,
      });
    }
  }
  return found;
}

async function pool<T>(items: T[], size: number, work: (item: T, index: number) => Promise<void>): Promise<void> {
  let cursor = 0;
  const runners: Promise<void>[] = Array.from({ length: size }, async (): Promise<void> => {
    while (cursor < items.length) {
      const index: number = cursor++;
      await work(items[index], index);
    }
  });
  await Promise.all(runners);
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URI) throw new Error("DATABASE_URI is not set");
  await mongoose.connect(process.env.DATABASE_URI);
  const images = mongoose.connection.collection<ImageRow>("images");
  await images.createIndex({ pathname: 1 }, { unique: true });
  const products = mongoose.connection.collection("products");

  const local: LocalImage[] = await scan();
  const existing = new Map<string, string>();
  for await (const row of images.find({}, { projection: { pathname: 1, url: 1 } })) {
    existing.set(row.pathname, row.url);
  }
  console.log(`${local.length} local images, ${existing.size} already uploaded`);

  const urlMap = new Map<string, string>();
  let done = 0;
  let failed = 0;
  await pool(local, CONCURRENCY, async (item: LocalImage): Promise<void> => {
    try {
      let url: string | undefined = existing.get(item.pathname);
      if (!url) {
        const buffer: Buffer = await readFile(item.file);
        const contentType: string = MIME[path.extname(item.filename).toLowerCase()];
        const result = await put(item.pathname, buffer, {
          access: "public",
          contentType,
          addRandomSuffix: false,
          allowOverwrite: true,
        });
        url = result.url;
        await images.updateOne(
          { pathname: item.pathname },
          {
            $set: { url, filename: item.filename, size: (await stat(item.file)).size, contentType },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true },
        );
      }
      urlMap.set(item.localUrl, url);
    } catch (error: unknown) {
      failed++;
      console.error(`FAILED ${item.pathname}`, error instanceof Error ? error.message : error);
    }
    done++;
    if (done % 25 === 0) console.log(`${done}/${local.length}`);
  });

  const swap = (value: unknown): unknown =>
    typeof value === "string" && urlMap.has(value) ? urlMap.get(value) : value;

  let updated = 0;
  for await (const doc of products.find({}, { projection: { images: 1, featuredImage: 1, variants: 1 } })) {
    const nextImages = (doc.images ?? []).map((image: { url: string }) => ({ ...image, url: swap(image.url) }));
    const nextVariants = (doc.variants ?? []).map((variant: { image?: string }) => ({
      ...variant,
      image: swap(variant.image),
    }));
    await products.updateOne(
      { _id: doc._id },
      { $set: { images: nextImages, variants: nextVariants, featuredImage: swap(doc.featuredImage) } },
    );
    updated++;
  }
  console.log(`uploaded ${urlMap.size}, failed ${failed}, products rewritten ${updated}`);
  await mongoose.disconnect();
}

main().catch((error: unknown): void => {
  console.error(error);
  process.exit(1);
});
