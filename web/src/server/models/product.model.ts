import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const mediaFields = {
  position: Number,
  filename: String,
  sourceUrl: String,
  localPath: String,
  url: { type: String, required: true },
  alt: String,
  width: Number,
  height: Number,
};

const imageSchema = new Schema(mediaFields, { _id: false });

const videoSchema = new Schema(
  { ...mediaFields, duration: Number, previewImage: String },
  { _id: false },
);

const modelSchema = new Schema(mediaFields, { _id: false });

const externalVideoSchema = new Schema(
  { host: String, externalId: String, url: String, position: Number },
  { _id: false },
);

const optionSchema = new Schema(
  { name: String, position: Number, values: [String] },
  { _id: false },
);

const variantSchema = new Schema(
  {
    id: Number,
    title: String,
    sku: String,
    barcode: String,
    price: Number,
    compareAtPrice: Number,
    available: Boolean,
    options: [String],
    grams: Number,
    requiresShipping: Boolean,
    taxable: Boolean,
    position: Number,
    image: String,
  },
  { _id: false },
);

const seoSchema = new Schema(
  { title: String, description: String, ogImage: String },
  { _id: false },
);

export const productSchema = new Schema(
  {
    sourceId: { type: Number, required: true, index: true },
    handle: { type: String, required: true, unique: true },
    slug: { type: String, required: true },
    sourceUrl: String,
    title: { type: String, required: true },
    vendor: String,
    productType: String,
    tags: { type: [String], default: [] },
    collections: { type: [String], default: [], index: true },
    categories: { type: [String], default: [], index: true },
    descriptionHtml: String,
    descriptionText: String,
    options: [optionSchema],
    variants: [variantSchema],
    price: { type: Number, required: true },
    priceMax: Number,
    compareAtPrice: Number,
    currency: { type: String, default: "INR" },
    available: { type: Boolean, default: true },
    active: { type: Boolean, default: true, index: true },
    featuredImage: String,
    images: [imageSchema],
    videos: [videoSchema],
    externalVideos: [externalVideoSchema],
    models3d: [modelSchema],
    mediaFolder: String,
    seo: seoSchema,
    structuredData: Schema.Types.Mixed,
    publishedAt: Date,
    sourceCreatedAt: Date,
    sourceUpdatedAt: Date,
    scrapedAt: Date,
  },
  { collection: "products", versionKey: false },
);

productSchema.index({ title: "text", descriptionText: "text", tags: "text" });
productSchema.index({ price: 1 });
productSchema.index({ publishedAt: -1 });

export const ACTIVE_PRODUCT: { active: { $ne: boolean } } = { active: { $ne: false } };

export type ProductDocument = InferSchemaType<typeof productSchema>;

export const ProductModel: Model<ProductDocument> =
  (models.Product as Model<ProductDocument> | undefined) ??
  model<ProductDocument>("Product", productSchema);
