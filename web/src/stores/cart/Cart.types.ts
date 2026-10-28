import type { CartCustomization } from "@/customizers/core";

export interface CartItem {
  key: string;
  handle: string;
  title: string;
  variantTitle: string | null;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  customization?: CartCustomization;
}

export interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  replace: (oldKey: string, item: CartItem) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}
