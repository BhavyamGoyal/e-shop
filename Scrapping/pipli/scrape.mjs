import { MongoClient } from "mongodb";
import { createWriteStream } from "node:fs";
import { mkdir, stat, rename, rm } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "https://piplistudio.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = process.env.PRODUCTS_DIR || path.resolve(__dirname, "../../web/public/products");
const PUBLIC_PREFIX = "/products";
const COLLECTION_NAME = process.env.SCRAPE_COLLECTION || "products";
const DB_NAME = process.env.SCRAPE_DB || undefined;
const DRY = process.argv.includes("--dry");
const LIMIT = Number((process.argv.find((a) => a.startsWith("--limit=")) || "").split("=")[1]) || Infinity;
const DOWNLOAD_CONCURRENCY = 6;
const PRODUCT_CONCURRENCY = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, label, attempts = 5) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const wait = 800 * i * i;
      console.warn(`  retry ${i}/${attempts} ${label}: ${err.message} (waiting ${wait}ms)`);
      await sleep(wait);
    }
  }
  throw lastErr;
}

async function getJson(url) {
  return withRetry(async () => {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" } });
    if (res.status === 429) throw new Error("rate limited (429)");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, url);
}

async function getText(url) {
  return withRetry(async () => {
    const res = await fetch(url, { headers: { "user-agent": UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }, url);
}

async function paginate(urlFor, key) {
  const all = [];
  for (let page = 1; ; page++) {
    const data = await getJson(urlFor(page));
    const items = data[key] || [];
    all.push(...items);
    if (items.length < 250) break;
  }
  return all;
}

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/-+$/g, "");

const toAbs = (u) => (u.startsWith("//") ? `https:${u}` : u);
const toNum = (v) => (v === null || v === undefined || v === "" ? null : Number(v));

function stripHtml(html) {
  return (html || "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

function extractJsonLd(html) {
  const out = [];
  const re = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      out.push(JSON.parse(m[1]));
    } catch {}
  }
  return out;
}

function extractMeta(html) {
  const pick = (re) => {
    const m = html.match(re);
    return m ? m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'") : null;
  };
  return {
    metaTitle: pick(/<title>([\s\S]*?)<\/title>/i)?.trim() || null,
    metaDescription: pick(/<meta\s+name="description"\s+content="([^"]*)"/i),
    ogImage: pick(/<meta\s+property="og:image"\s+content="([^"]*)"/i),
  };
}

async function exists(file) {
  try {
    const s = await stat(file);
    return s.size > 0;
  } catch {
    return false;
  }
}

async function download(url, dest) {
  if (await exists(dest)) return "cached";
  await mkdir(path.dirname(dest), { recursive: true });
  await withRetry(async () => {
    const res = await fetch(url, { headers: { "user-agent": UA, referer: BASE + "/" } });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    const tmp = `${dest}.part`;
    try {
      await pipeline(Readable.fromWeb(res.body), createWriteStream(tmp));
      await rename(tmp, dest);
    } catch (err) {
      await rm(tmp, { force: true });
      throw err;
    }
  }, url);
  return "downloaded";
}

async function runPool(items, size, worker) {
  const results = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return results;
}

function extFromUrl(url, fallback) {
  const p = new URL(url).pathname;
  const ext = path.extname(p).toLowerCase();
  return ext || fallback;
}

function pickVideoSource(sources) {
  const mp4s = (sources || []).filter((s) => s.format === "mp4" || /mp4/.test(s.mime_type || ""));
  const pool = mp4s.length ? mp4s : sources || [];
  return pool.sort((a, b) => (b.height || 0) - (a.height || 0))[0] || null;
}

function buildMediaPlan(handle, jsMedia, listImages) {
  const folder = handle;
  const plan = [];
  const seenImages = new Set();
  let n = 0;

  const pushImage = (src, meta) => {
    const abs = toAbs(src);
    const key = abs.split("?")[0];
    if (seenImages.has(key)) return;
    seenImages.add(key);
    n++;
    const base = path.basename(new URL(abs).pathname).replace(/[^\w.\-]/g, "_");
    const filename = `${String(n).padStart(2, "0")}-${base}`;
    plan.push({
      kind: "image",
      sourceUrl: abs,
      filename,
      relPath: `images/${filename}`,
      alt: meta.alt || null,
      width: meta.width || null,
      height: meta.height || null,
      position: meta.position || n,
    });
  };

  let v = 0;
  for (const m of jsMedia || []) {
    if (m.media_type === "image") {
      pushImage(m.src, { alt: m.alt, width: m.width, height: m.height, position: m.position });
    } else if (m.media_type === "video") {
      const src = pickVideoSource(m.sources);
      if (!src) continue;
      v++;
      const filename = `${String(v).padStart(2, "0")}-video${extFromUrl(src.url, ".mp4")}`;
      plan.push({
        kind: "video",
        sourceUrl: toAbs(src.url),
        filename,
        relPath: `videos/${filename}`,
        alt: m.alt || null,
        width: src.width || null,
        height: src.height || null,
        position: m.position || null,
        duration: m.duration || null,
        previewImage: m.preview_image?.src ? toAbs(m.preview_image.src) : null,
      });
    } else if (m.media_type === "external_video") {
      plan.push({
        kind: "external_video",
        sourceUrl: m.external_id && m.host === "youtube" ? `https://www.youtube.com/watch?v=${m.external_id}` : null,
        host: m.host || null,
        externalId: m.external_id || null,
        position: m.position || null,
      });
    } else if (m.media_type === "model_3d") {
      const src = (m.sources || []).find((s) => s.format === "glb") || (m.sources || [])[0];
      if (!src) continue;
      const filename = `${String(plan.length + 1).padStart(2, "0")}-model${extFromUrl(src.url, ".glb")}`;
      plan.push({
        kind: "model_3d",
        sourceUrl: toAbs(src.url),
        filename,
        relPath: `models/${filename}`,
        position: m.position || null,
      });
    }
  }

  for (const img of listImages || []) {
    pushImage(img.src, { alt: img.alt, width: img.width, height: img.height, position: img.position });
  }

  return { folder, plan };
}

async function processProduct(listProduct, collectionsByHandle, index, total) {
  const handle = listProduct.handle;
  const pageUrl = `${BASE}/products/${handle}`;
  console.log(`[${index + 1}/${total}] ${listProduct.title}`);

  const js = await getJson(`${pageUrl}.js`);
  let html = "";
  try {
    html = await getText(pageUrl);
  } catch (err) {
    console.warn(`  could not load product page HTML: ${err.message}`);
  }
  const meta = extractMeta(html);
  const jsonLd = extractJsonLd(html);
  const productLd = jsonLd.flat().find((x) => x && (x["@type"] === "Product" || x["@type"] === "ProductGroup")) || null;

  const { folder, plan } = buildMediaPlan(handle, js.media, listProduct.images);
  const productDir = path.join(OUT_ROOT, folder);

  const images = [];
  const videos = [];
  const models = [];
  const externalVideos = [];

  if (!DRY) {
    await runPool(plan.filter((p) => p.relPath), DOWNLOAD_CONCURRENCY, async (item) => {
      try {
        await download(item.sourceUrl, path.join(productDir, item.relPath));
        item.ok = true;
      } catch (err) {
        item.ok = false;
        console.warn(`  FAILED ${item.sourceUrl}: ${err.message}`);
      }
    });
  }

  for (const item of plan) {
    if (item.kind === "external_video") {
      externalVideos.push({ host: item.host, externalId: item.externalId, url: item.sourceUrl, position: item.position });
      continue;
    }
    if (!DRY && item.ok === false) continue;
    const record = {
      position: item.position,
      filename: item.filename,
      sourceUrl: item.sourceUrl,
      localPath: path.join(productDir, item.relPath),
      url: `${PUBLIC_PREFIX}/${folder}/${item.relPath}`,
      alt: item.alt ?? null,
      width: item.width ?? null,
      height: item.height ?? null,
    };
    if (item.kind === "image") images.push(record);
    else if (item.kind === "video") {
      record.duration = item.duration;
      record.previewImage = item.previewImage;
      videos.push(record);
    } else if (item.kind === "model_3d") models.push(record);
  }

  const imageUrlBySource = new Map(images.map((i) => [i.sourceUrl.split("?")[0], i.url]));
  const variants = (listProduct.variants || []).map((v) => ({
    id: v.id,
    title: v.title,
    sku: v.sku || null,
    barcode: v.barcode || null,
    price: toNum(v.price),
    compareAtPrice: toNum(v.compare_at_price),
    available: v.available ?? null,
    options: [v.option1, v.option2, v.option3].filter((o) => o !== null && o !== undefined),
    grams: v.grams ?? null,
    requiresShipping: v.requires_shipping ?? null,
    taxable: v.taxable ?? null,
    position: v.position,
    image: v.featured_image?.src ? imageUrlBySource.get(toAbs(v.featured_image.src).split("?")[0]) || null : null,
  }));

  const prices = variants.map((v) => v.price).filter((p) => p !== null);
  const compare = variants.map((v) => v.compareAtPrice).filter((p) => p !== null);

  const doc = {
    sourceId: listProduct.id,
    handle,
    slug: handle,
    sourceUrl: pageUrl,
    title: listProduct.title,
    vendor: listProduct.vendor || null,
    productType: listProduct.product_type || null,
    tags: Array.isArray(listProduct.tags) ? listProduct.tags : String(listProduct.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
    collections: collectionsByHandle.get(handle) || [],
    descriptionHtml: listProduct.body_html || js.description || "",
    descriptionText: stripHtml(listProduct.body_html || js.description || ""),
    options: (listProduct.options || []).map((o) => ({ name: o.name, position: o.position, values: o.values })),
    variants,
    price: prices.length ? Math.min(...prices) : null,
    priceMax: prices.length ? Math.max(...prices) : null,
    compareAtPrice: compare.length ? Math.max(...compare) : null,
    currency: "INR",
    available: js.available ?? variants.some((v) => v.available),
    featuredImage: images[0]?.url || null,
    images,
    videos,
    externalVideos,
    models3d: models,
    mediaFolder: `${PUBLIC_PREFIX}/${folder}/`,
    seo: { title: meta.metaTitle, description: meta.metaDescription, ogImage: meta.ogImage },
    structuredData: productLd,
    publishedAt: listProduct.published_at ? new Date(listProduct.published_at) : null,
    sourceCreatedAt: listProduct.created_at ? new Date(listProduct.created_at) : null,
    sourceUpdatedAt: listProduct.updated_at ? new Date(listProduct.updated_at) : null,
    scrapedAt: new Date(),
  };

  console.log(`  ${images.length} images, ${videos.length} videos, ${variants.length} variants, collections: ${doc.collections.join(", ") || "-"}`);
  return doc;
}

async function main() {
  const uri = process.env.DATABASE_URI;
  if (!DRY && !uri) throw new Error("DATABASE_URI is not set");

  console.log(`Output folder: ${OUT_ROOT}`);
  console.log("Fetching collections...");
  const collections = await paginate((p) => `${BASE}/collections.json?limit=250&page=${p}`, "collections");
  console.log(`Found ${collections.length} collections`);

  const collectionsByHandle = new Map();
  for (const c of collections) {
    if (c.handle === "all") continue;
    const prods = await paginate((p) => `${BASE}/collections/${c.handle}/products.json?limit=250&page=${p}`, "products");
    for (const p of prods) {
      if (!collectionsByHandle.has(p.handle)) collectionsByHandle.set(p.handle, []);
      collectionsByHandle.get(p.handle).push(c.handle);
    }
    console.log(`  ${c.handle}: ${prods.length}`);
  }

  console.log("Fetching product list...");
  let products = await paginate((p) => `${BASE}/products.json?limit=250&page=${p}`, "products");
  console.log(`Found ${products.length} products`);
  products = products.slice(0, LIMIT);

  const docs = await runPool(products, PRODUCT_CONCURRENCY, async (p, i) => {
    try {
      return await processProduct(p, collectionsByHandle, i, products.length);
    } catch (err) {
      console.error(`  FAILED product ${p.handle}: ${err.message}`);
      return null;
    }
  });

  const good = docs.filter(Boolean);
  const failed = products.length - good.length;

  if (DRY) {
    console.log(`Dry run complete: ${good.length} products processed, nothing written to MongoDB or disk.`);
    return;
  }

  const client = new MongoClient(uri);
  await client.connect();
  try {
    const col = client.db(DB_NAME).collection(COLLECTION_NAME);
    await col.createIndex({ handle: 1 }, { unique: true });
    await col.createIndex({ sourceId: 1 });
    await col.createIndex({ collections: 1 });
    await col.createIndex({ title: "text", descriptionText: "text", tags: "text" });
    if (good.length) {
      const result = await col.bulkWrite(
        good.map((d) => ({
          updateOne: { filter: { handle: d.handle }, update: { $set: d }, upsert: true },
        }))
      );
      console.log(`MongoDB: ${result.upsertedCount} inserted, ${result.modifiedCount} updated, ${result.matchedCount} matched`);
    }
    console.log(`Database "${col.dbName}", collection "${COLLECTION_NAME}" now has ${await col.countDocuments()} documents`);
  } finally {
    await client.close();
  }

  console.log(`Done. ${good.length} products saved, ${failed} failed.`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
