import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { WishlistItem, WishlistState } from "@/stores/wishlist/Wishlist.types";

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (item: WishlistItem): void => {
        set((state) => ({
          items: state.items.some((entry) => entry.handle === item.handle)
            ? state.items.filter((entry) => entry.handle !== item.handle)
            : [...state.items, item],
        }));
      },
      remove: (handle: string): void => {
        set((state) => ({ items: state.items.filter((entry) => entry.handle !== handle) }));
      },
      replace: (items: WishlistItem[]): void => {
        set({ items });
      },
    }),
    {
      name: "tinglet-wishlist",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const isWishlisted = (items: WishlistItem[], handle: string): boolean =>
  items.some((entry) => entry.handle === handle);
