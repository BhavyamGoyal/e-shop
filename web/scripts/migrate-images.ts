import { copyFile, mkdir, readdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import sharp from "sharp";

interface LocalImage {
  folder: string;
  filename: string;
  file: string;
  stem: string;
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
const BACKUP: string = path.resolve("..", "original-images");
const CONCURRENCY = 4;
const EXTENSIONS: string[] = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".heic",
];

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
      const extension: string = path.extname(filename).toLowerCase();
      if (!EXTENSIONS.includes(extension)) continue;
      found.push({
        folder,
        filename,
        file: path.join(dir, filename),
        stem: path.basename(filename, path.extname(filename)),
      });
    }
  }
  return found;
}

async function pool<T>(
  items: T[],
  size: number,
  work: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const runners: Promise<void>[] = Array.from(
    { length: size },
    async (): Promise<void> => {
      while (cursor < items.length) await work(items[cursor++]);
    },
  );
  await Promise.all(runners);
}

async function toWebp(item: LocalImage): Promise<string> {
  if (path.extname(item.filename).toLowerCase() === ".webp") return item.file;
  const target: string = path.join(
    path.dirname(item.file),
    `${item.stem}.webp`,
  );
  await sharp(item.file, { animated: true })
    .webp({ quality: 82 })
    .toFile(target);
  const backupDir: string = path.join(BACKUP, item.folder);
  await mkdir(backupDir, { recursive: true });
  await rename(item.file, path.join(backupDir, item.filename)).catch(
    (): Promise<void> =>
      copyFile(item.file, path.join(backupDir, item.filename)),
  );
  return target;
}

async function main(): Promise<void> {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI);
  const images = mongoose.connection.collection<ImageRow>("images");
  const products = mongoose.connection.collection("products");
  await images.createIndex({ pathname: 1 }, { unique: true });

  const oldRows = await images.find({ url: /^https?:/ }).toArray();
  const oldByPathname = new Map<string, string>(
    oldRows.map((row): [string, string] => [row.pathname, row.url]),
  );

  const local: LocalImage[] = await scan();
  console.log(`${local.length} local images, ${oldRows.length} blob rows`);

  const urlMap = new Map<string, string>();
  let done = 0;
  let failed = 0;
  await pool(local, CONCURRENCY, async (item: LocalImage): Promise<void> => {
    try {
      const target: string = await toWebp(item);
      const name: string = path.basename(target);
      const pathname = `products/${item.folder}/${name}`;
      const url = `/products/${item.folder}/images/${name}`;
      await images.updateOne(
        { pathname },
        {
          $set: {
            url,
            filename: name,
            size: (await stat(target)).size,
            contentType: "image/webp",
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true },
      );
      const oldUrl: string | undefined = oldByPathname.get(
        `products/${item.folder}/${item.filename}`,
      );
      if (oldUrl) urlMap.set(oldUrl, url);
    } catch (error: unknown) {
      failed++;
      console.error(
        `FAILED ${item.file}`,
        error instanceof Error ? error.message : error,
      );
    }
    if (++done % 50 === 0) console.log(`${done}/${local.length}`);
  });

  const swap = (value: unknown): unknown =>
    typeof value === "string" && urlMap.has(value) ? urlMap.get(value) : value;
  const baseName = (value: unknown): string | undefined =>
    typeof value === "string" ? value.split("/").pop() : undefined;

  let updated = 0;
  for await (const doc of products.find(
    {},
    { projection: { images: 1, featuredImage: 1, variants: 1 } },
  )) {
    const nextImages = (doc.images ?? []).map(
      (image: { url: string; filename?: string }) => {
        const url = swap(image.url);
        return url === image.url
          ? image
          : { ...image, url, filename: baseName(url) };
      },
    );
    const nextVariants = (doc.variants ?? []).map(
      (variant: { image?: string }) => ({
        ...variant,
        image: swap(variant.image),
      }),
    );
    await products.updateOne(
      { _id: doc._id },
      {
        $set: {
          images: nextImages,
          variants: nextVariants,
          featuredImage: swap(doc.featuredImage),
        },
      },
    );
    updated++;
  }

  const stale = await images.deleteMany({
    url: /^https?:/,
    pathname: { $in: oldRows.map((row): string => row.pathname) },
  });
  console.log(
    `mapped ${urlMap.size}, failed ${failed}, products rewritten ${updated}, blob rows removed ${stale.deletedCount}`,
  );
  await mongoose.disconnect();
}

main().catch((error: unknown): void => {
  console.error(error);
  process.exit(1);
});
