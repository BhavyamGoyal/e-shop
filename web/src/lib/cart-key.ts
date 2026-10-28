const CUSTOMIZATION_SEPARATOR = "~";
const ID_LENGTH = 8;

export interface ParsedCartKey {
  handle: string;
  variantId: number | null;
  customizationId: string | null;
}

export const newCustomizationId = (): string =>
  Math.random()
    .toString(36)
    .slice(2, 2 + ID_LENGTH)
    .padEnd(ID_LENGTH, "0");

export function buildCartKey(handle: string, variantId: number | null, customizationId?: string | null): string {
  const base: string = customizationId ? `${handle}${CUSTOMIZATION_SEPARATOR}${customizationId}` : handle;
  return `${base}:${variantId ?? "default"}`;
}

export function parseCartKey(key: string): ParsedCartKey | null {
  const index: number = key.lastIndexOf(":");
  if (index < 1) return null;
  const suffix: string = key.slice(index + 1);
  const head: string = key.slice(0, index);
  const variantId: number | null = suffix === "default" ? null : Number(suffix);
  if (variantId !== null && !Number.isInteger(variantId)) return null;
  const split: number = head.indexOf(CUSTOMIZATION_SEPARATOR);
  if (split < 0) return { handle: head, variantId, customizationId: null };
  return { handle: head.slice(0, split), variantId, customizationId: head.slice(split + 1) };
}
