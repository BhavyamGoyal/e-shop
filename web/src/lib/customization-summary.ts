import type { CartCustomization } from "@/customizers/core";
import { parseCartKey, type ParsedCartKey } from "@/lib/cart-key";

const SUMMARY_KEY = "text";

export function customizationSummary(customization: CartCustomization): string {
  const value: unknown = customization.params[SUMMARY_KEY];
  return typeof value === "string" && value ? value.replace(/\s+/g, " ").trim() : "Customized";
}

export function customizeEditHref(handle: string, key: string, customization: CartCustomization): string {
  const parsed: ParsedCartKey | null = parseCartKey(key);
  const query: URLSearchParams = new URLSearchParams({ product: handle, edit: key });
  if (parsed?.variantId) query.set("variant", String(parsed.variantId));
  return `/customize/${customization.slug}?${query.toString()}`;
}
