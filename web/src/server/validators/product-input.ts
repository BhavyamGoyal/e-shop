import { ValidationError } from "../http/errors";
import type { ImageInput, OptionInput, ProductInput, VariantInput } from "../types/admin.types";

type Raw = Record<string, unknown>;

const asRecord = (value: unknown): Raw =>
  value && typeof value === "object" ? (value as Raw) : {};

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const strings = (value: unknown): string[] =>
  list(value)
    .map(text)
    .filter((item: string): boolean => item.length > 0);

function amount(value: unknown, label: string): number {
  const parsed: number = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new ValidationError(`${label} must be a positive number`);
  return parsed;
}

function optionalAmount(value: unknown, label: string): number | null {
  if (value === null || value === undefined || value === "") return null;
  return amount(value, label);
}

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toImage = (value: unknown): ImageInput => {
  const raw: Raw = asRecord(value);
  return { url: text(raw.url), alt: text(raw.alt) };
};

const toOption = (value: unknown): OptionInput => {
  const raw: Raw = asRecord(value);
  return { name: text(raw.name), values: strings(raw.values) };
};

const toVariant = (value: unknown, index: number): VariantInput => {
  const raw: Raw = asRecord(value);
  const id: number = Number(raw.id);
  return {
    id: Number.isFinite(id) && id > 0 ? id : null,
    title: text(raw.title),
    sku: text(raw.sku),
    price: amount(raw.price, `Variant ${index + 1} price`),
    compareAtPrice: optionalAmount(raw.compareAtPrice, `Variant ${index + 1} compare price`),
    available: raw.available !== false,
    options: strings(raw.options),
    image: text(raw.image),
  };
};

export function parseProductInput(payload: unknown): ProductInput {
  const raw: Raw = asRecord(payload);
  const title: string = text(raw.title);
  if (!title) throw new ValidationError("Title is required");
  const handle: string = slugify(text(raw.handle) || title);
  if (!handle) throw new ValidationError("Handle is required");
  return {
    title,
    handle,
    vendor: text(raw.vendor),
    productType: text(raw.productType),
    tags: strings(raw.tags),
    categories: strings(raw.categories),
    collections: strings(raw.collections).map(slugify),
    descriptionHtml: typeof raw.descriptionHtml === "string" ? raw.descriptionHtml : "",
    price: amount(raw.price, "Price"),
    compareAtPrice: optionalAmount(raw.compareAtPrice, "Compare-at price"),
    available: raw.available !== false,
    active: raw.active !== false,
    images: list(raw.images).map(toImage).filter((image: ImageInput): boolean => image.url.length > 0),
    options: list(raw.options).map(toOption).filter((option: OptionInput): boolean => option.name.length > 0),
    variants: list(raw.variants).map(toVariant),
    seoTitle: text(raw.seoTitle),
    seoDescription: text(raw.seoDescription),
  };
}
