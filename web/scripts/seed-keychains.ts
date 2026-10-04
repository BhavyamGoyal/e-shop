import { mkdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import sharp from "sharp";
import { KEYCHAINS, type KeychainSeed } from "./data/keychains.ts";

const ROOT: string = path.resolve("public", "products");
const SOURCE_DIR: string = path.join(ROOT, "keychains");

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escape = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function buildHtml(item: KeychainSeed): string {
  const features: string = item.features.map((line: string): string => `<li>${escape(line)}</li>`).join("");
  const rows: string = item.details
    .map(([label, value]: [string, string]): string => `<tr><td><strong>${escape(label)}</strong></td><td>${escape(value)}</td></tr>`)
    .join("");
  return [
    `<article>`,
    `<p><strong>${escape(item.tagline)}</strong></p>`,
    `<p>${escape(item.intro)}</p>`,
    `<h3>Why you'll love it</h3>`,
    `<ul>${features}</ul>`,
    `<h3>Details</h3>`,
    `<table>${rows}</table>`,
    `</article>`,
  ].join("");
}

function buildText(item: KeychainSeed): string {
  return [item.tagline, item.intro, ...item.features, ...item.details.map(([l, v]: [string, string]): string => `${l}: ${v}`)].join("\n");
}

async function place(item: KeychainSeed, handle: string): Promise<{ url: string; filename: string; size: number; width: number; height: number }> {
  const filename = `01-${slugify(path.basename(item.source, ".webp"))}.webp`;
  const folder: string = path.join(ROOT, handle, "images");
  const target: string = path.join(folder, filename);
  await mkdir(folder, { recursive: true });
  const from: string = path.join(SOURCE_DIR, item.source);
  const exists: boolean = await stat(from).then((): boolean => true, (): boolean => false);
  if (exists) await rename(from, target);
  const meta = await sharp(target).metadata();
  return {
    url: `/products/${handle}/images/${filename}`,
    filename,
    size: (await stat(target)).size,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}

function buildVariants(item: KeychainSeed, url: string, seed: number): Record<string, unknown>[] {
  return item.optionValues.map((value: string, index: number): Record<string, unknown> => ({
    id: seed + index,
    title: value,
    sku: `KEY-${slugify(item.source.split(".")[0]).toUpperCase()}-${index + 1}`,
    barcode: null,
    price: item.price,
    compareAtPrice: item.compareAtPrice,
    available: true,
    options: [value],
    grams: item.grams,
    requiresShipping: true,
    taxable: false,
    position: index + 1,
    image: url,
  }));
}

async function main(): Promise<void> {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI);
  const products = mongoose.connection.collection("products");
  const images = mongoose.connection.collection("images");
  const now: Date = new Date();
  const base: number = Date.now();

  for (const [index, item] of KEYCHAINS.entries()) {
    const handle: string = slugify(item.title);
    const image = await place(item, handle);
    const html: string = buildHtml(item);
    const text: string = buildText(item);
    const existing = await products.findOne({ handle }, { projection: { sourceId: 1 } });
    const sourceId: number = existing?.sourceId ?? base + index * 100;

    await products.updateOne(
      { handle },
      {
        $set: {
          sourceId,
          handle,
          slug: handle,
          title: item.title,
          vendor: "Tinglet",
          productType: "keychain",
          tags: item.tags,
          collections: item.collections,
          descriptionHtml: html,
          descriptionText: text,
          options: [{ name: item.optionName, position: 1, values: item.optionValues }],
          variants: buildVariants(item, image.url, sourceId),
          price: item.price,
          priceMax: item.price,
          compareAtPrice: item.compareAtPrice,
          currency: "INR",
          available: true,
          featuredImage: image.url,
          images: [{ position: 1, filename: image.filename, url: image.url, alt: item.title, width: image.width, height: image.height }],
          videos: [],
          externalVideos: [],
          models3d: [],
          mediaFolder: `/products/${handle}/`,
          seo: { title: `${item.title} | Tinglet`, description: item.intro, ogImage: image.url },
          publishedAt: now,
        },
        $setOnInsert: { sourceCreatedAt: now },
      },
      { upsert: true },
    );

    await images.updateOne(
      { pathname: `products/${handle}/${image.filename}` },
      {
        $set: { url: image.url, filename: image.filename, size: image.size, contentType: "image/webp" },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
    console.log(`${existing ? "updated" : "inserted"} ${handle}`);
  }

  await mongoose.disconnect();
}

main().catch((error: unknown): void => {
  console.error(error);
  process.exit(1);
});
