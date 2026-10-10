import { QueryError } from "../http/errors";
import type { ProductDocument } from "../models/product.model";
import { productRepository } from "../repositories/product.repository";
import type { OrderLineRecord } from "../types/order.types";

type Raw = Record<string, unknown>;
type Variant = NonNullable<ProductDocument["variants"]>[number];

interface RequestedLine {
  key: string;
  quantity: number;
}

interface ParsedKey {
  handle: string;
  variantId: number | null;
}

export interface PricedCart {
  items: OrderLineRecord[];
  total: number;
}

const MAX_LINES = 100;
const MAX_QUANTITY = 99;
const INVALID_ITEM = "Invalid cart item";

function parseRequested(payload: unknown): RequestedLine[] {
  const items: unknown = ((payload ?? {}) as Raw).items;
  if (!Array.isArray(items) || items.length === 0) throw new QueryError("Your cart is empty");
  if (items.length > MAX_LINES) throw new QueryError("Too many items in cart");
  const lines: RequestedLine[] = items.map((value: unknown): RequestedLine => {
    const raw: Raw = (value ?? {}) as Raw;
    const quantity: number = Number(raw.quantity);
    if (typeof raw.key !== "string" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new QueryError(INVALID_ITEM);
    }
    return { key: raw.key, quantity };
  });
  if (new Set(lines.map((line: RequestedLine): string => line.key)).size !== lines.length) {
    throw new QueryError("Duplicate items in cart");
  }
  return lines;
}

function parseKey(key: string): ParsedKey {
  const index: number = key.lastIndexOf(":");
  if (index < 1) throw new QueryError(INVALID_ITEM);
  const suffix: string = key.slice(index + 1);
  const handle: string = key.slice(0, index);
  if (suffix === "default") return { handle, variantId: null };
  const variantId: number = Number(suffix);
  if (!Number.isInteger(variantId)) throw new QueryError(INVALID_ITEM);
  return { handle, variantId };
}

async function priceLine(line: RequestedLine): Promise<OrderLineRecord> {
  const { handle, variantId }: ParsedKey = parseKey(line.key);
  const product: ProductDocument | null = await productRepository.findByHandle(handle);
  if (!product) throw new QueryError("A product in your cart is no longer available");
  const variant: Variant | undefined =
    variantId === null ? undefined : (product.variants ?? []).find((item: Variant): boolean => item.id === variantId);
  if (variantId !== null && !variant) throw new QueryError(`"${product.title}" option is no longer available`);
  const inStock: boolean = variant ? variant.available !== false : product.available !== false;
  if (!inStock) throw new QueryError(`"${product.title}" is out of stock`);
  return {
    key: line.key,
    handle,
    variantId,
    title: product.title,
    variantTitle: variant?.title ?? null,
    image: variant?.image ?? product.featuredImage ?? product.images?.[0]?.url ?? null,
    unitAmount: Math.round((variant?.price ?? product.price) * 100),
    quantity: line.quantity,
  };
}

export async function priceCart(payload: unknown): Promise<PricedCart> {
  const items: OrderLineRecord[] = await Promise.all(parseRequested(payload).map(priceLine));
  const total: number = items.reduce(
    (sum: number, line: OrderLineRecord): number => sum + line.unitAmount * line.quantity,
    0,
  );
  return { items, total };
}
