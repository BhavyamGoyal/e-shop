"use client";

import Link from "next/link";
import { EmptyState } from "../molecules/States/EmptyState";
import { useHydrated } from "@/hooks/useHydrated";
import { formatPrice } from "@/lib/format-price";
import { useWishlistStore } from "@/stores/wishlist/Wishlist.store";
import type { WishlistItem } from "@/stores/wishlist/Wishlist.types";

export function WishlistView() {
  const hydrated: boolean = useHydrated();
  const items: WishlistItem[] = useWishlistStore((state) => state.items);
  const remove = useWishlistStore((state) => state.remove);

  if (!hydrated) return <div className="h-64" aria-busy />;

  if (items.length === 0) {
    return <EmptyState title="Your wishlist is empty" message="Tap the heart on a product to save it here." />;
  }

  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item: WishlistItem) => (
        <li key={item.handle} className="flex flex-col gap-2">
          <Link href={`/product/${item.handle}`} className="block">
            <div className="overflow-hidden rounded-[12px] bg-muted" style={{ aspectRatio: 0.8 }}>
              {item.image && <img src={item.image} alt={item.title} className="h-full w-full object-cover" />}
            </div>
            <div className="mt-2 line-clamp-2 text-sm font-medium">{item.title}</div>
            <div className="font-bold">{formatPrice(item.price)}</div>
          </Link>
          <button
            type="button"
            onClick={(): void => remove(item.handle)}
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-danger"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
