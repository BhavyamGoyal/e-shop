import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, CartState } from "@/stores/cart/Cart.types";

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

const clamp = (value: number): number => Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, value));

export const cartCount = (items: CartItem[]): number =>
  items.reduce((total: number, item: CartItem): number => total + item.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) => {
        set((state) => {
          const existing: CartItem | undefined = state.items.find((line: CartItem): boolean => line.key === item.key);
          if (!existing) return { items: [...state.items, { ...item, quantity: clamp(item.quantity) }] };
          return {
            items: state.items.map((line: CartItem): CartItem =>
              line.key === item.key ? { ...item, quantity: clamp(line.quantity + item.quantity) } : line,
            ),
          };
        });
      },
      setQuantity: (key, quantity) => {
        set((state) => ({
          items: state.items.map((line: CartItem): CartItem =>
            line.key === key ? { ...line, quantity: clamp(quantity) } : line,
          ),
        }));
      },
      remove: (key) => {
        set((state) => ({ items: state.items.filter((line: CartItem): boolean => line.key !== key) }));
      },
      clear: () => {
        set({ items: [] });
      },
    }),
    {
      name: "tinglet-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
