import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import sharp from "sharp";
import { CDN, type CandleSeed } from "./data/candle-types";
import { CANDLES_A } from "./data/candles-a";
import { CANDLES_B } from "./data/candles-b";

const ROOT: string = path.resolve("public", "products");
const CATEGORY = { name: "Candles", slug: "candles" };

interface Placed {
  url: string;
  filename: string;
  size: number;
  width: number;
  height: number;
}

const slugify = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const escape = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function buildHtml(item: CandleSeed): string {
  const features: string = item.features.map((line: string): string => `<li>${escape(line)}</li>`).join("");
  const rows: string = item.details
    .map(([label, value]: [string, string]): string => `<tr><td><strong>${escape(label)}</strong></td><td>${escape(value)}</td></tr>`)
    .join("");
  return `<article><p>${escape(item.intro)}</p><h3>Highlights</h3><ul>${features}</ul><h3>Details</h3><table>${rows}</table></article>`;
}

function buildText(item: CandleSeed): string {
  return [item.intro, ...item.features, ...item.details.map(([l, v]: [string, string]): string => `${l}: ${v}`)].join("\n");
}

async function download(handle: string, source: string, index: number): Promise<Placed> {
  const response: Response = await fetch(`${CDN}${source}`);
  if (!response.ok) throw new Error(`${response.status} ${source}`);
  const buffer: Buffer = Buffer.from(await response.arrayBuffer());
  const stem: string = slugify(path.basename(source.split("?")[0], path.extname(source.split("?")[0]))).slice(0, 40);
  const filename = `${String(index + 1).padStart(2, "0")}-${stem}.webp`;
  const folder: string = path.join(ROOT, handle, "images");
  const target: string = path.join(folder, filename);
  await mkdir(folder, { recursive: true });
  const output: Buffer = await sharp(buffer).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  await writeFile(target, output);
  const meta = await sharp(output).metadata();
  return {
    url: `/products/${handle}/images/${filename}`,
    filename,
    size: (await stat(target)).size,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}

function buildVariants(item: CandleSeed, handle: string, seed: number, image: string): Record<string, unknown>[] {
  return item.optionValues.map((value: string, index: number): Record<string, unknown> => ({
    id: seed + index,
    title: value,
    sku: `CND-${slugify(handle).toUpperCase().slice(0, 30)}-${index + 1}`,
    barcode: null,
    price: item.price,
    compareAtPrice: item.compareAtPrice,
    available: true,
    options: [value],
    grams: 100,
    requiresShipping: true,
    taxable: false,
    position: index + 1,
    image,
  }));
}

async function main(): Promise<void> {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI);
  const products = mongoose.connection.collection("products");
  const images = mongoose.connection.collection("images");
  const categories = mongoose.connection.collection("categories");
  const now: Date = new Date();
  const base: number = Date.now();

  const count: number = await categories.countDocuments();
  await categories.updateOne(
    { slug: CATEGORY.slug },
    {
      $setOnInsert: {
        name: CATEGORY.name,
        slug: CATEGORY.slug,
        image: "",
        icon: "",
        description: "Handmade scented soy wax candles for gifting and decor.",
        position: count,
        showOnHome: true,
        active: true,
        createdAt: now,
      },
    },
    { upsert: true },
  );

  for (const [index, item] of [...CANDLES_A, ...CANDLES_B].entries()) {
    const handle: string = slugify(item.title);
    const placed: Placed[] = [];
    for (const [position, source] of item.images.entries()) placed.push(await download(handle, source, position));
    const featured: string = placed[0].url;
    const existing = await products.findOne({ handle }, { projection: { sourceId: 1 } });
    const sourceId: number = existing?.sourceId ?? base + index * 100;
    const description: string = item.intro;

    await products.updateOne(
      { handle },
      {
        $set: {
          sourceId,
          handle,
          slug: handle,
          title: item.title,
          vendor: "The Sparkle Story",
          productType: "candle",
          tags: ["candle", "soy wax", "scented", "handmade", "gift"],
          collections: ["candles"],
          categories: [CATEGORY.slug],
          descriptionHtml: buildHtml(item),
          descriptionText: buildText(item),
          options: [{ name: item.optionName, position: 1, values: item.optionValues }],
          variants: buildVariants(item, handle, sourceId, featured),
          price: item.price,
          priceMax: item.price,
          compareAtPrice: item.compareAtPrice,
          currency: "INR",
          available: true,
          active: true,
          featuredImage: featured,
          images: placed.map((image: Placed, position: number): Record<string, unknown> => ({
            position: position + 1,
            filename: image.filename,
            url: image.url,
            alt: item.title,
            width: image.width,
            height: image.height,
          })),
          videos: [],
          externalVideos: [],
          models3d: [],
          mediaFolder: `/products/${handle}/`,
          seo: { title: `${item.title} | Candles`, description, ogImage: featured },
          publishedAt: now,
        },
        $setOnInsert: { sourceCreatedAt: now },
      },
      { upsert: true },
    );

    for (const image of placed) {
      await images.updateOne(
        { pathname: `products/${handle}/${image.filename}` },
        {
          $set: { url: image.url, filename: image.filename, size: image.size, contentType: "image/webp" },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true },
      );
    }
    console.log(`${existing ? "updated" : "inserted"} ${handle} (${placed.length} images)`);
  }

  await mongoose.disconnect();
}

main().catch((error: unknown): void => {
  console.error(error);
  process.exit(1);
});
