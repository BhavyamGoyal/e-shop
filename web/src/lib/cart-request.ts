import type { CartCustomization } from "@/customizers/core";
import type { CartItem } from "@/stores/cart/Cart.types";

export interface CartRequestLine {
  key: string;
  quantity: number;
  customization?: Pick<CartCustomization, "slug" | "params">;
}

export const toRequestLines = (items: CartItem[]): CartRequestLine[] =>
  items.map(
    (item: CartItem): CartRequestLine => ({
      key: item.key,
      quantity: item.quantity,
      customization: item.customization ? { slug: item.customization.slug, params: item.customization.params } : undefined,
    }),
  );
