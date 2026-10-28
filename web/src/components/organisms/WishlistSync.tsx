"use client";

import { useEffect } from "react";
import { fetchProfile } from "@/lib/profile-api";
import { useWishlistStore } from "@/stores/wishlist/Wishlist.store";
import type { WishlistItem } from "@/stores/wishlist/Wishlist.types";

const pushWishlist = (items: WishlistItem[]): void => {
  void fetch("/api/wishlist", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).catch((): void => undefined);
};

const merge = (server: WishlistItem[], local: WishlistItem[]): WishlistItem[] => {
  const known: Set<string> = new Set(server.map((item: WishlistItem): string => item.handle));
  return [...server, ...local.filter((item: WishlistItem): boolean => !known.has(item.handle))];
};

export function WishlistSync() {
  useEffect(() => {
    let active: boolean = true;
    let unsubscribe: (() => void) | null = null;
    const start = async (): Promise<void> => {
      const profile = await fetchProfile().catch(() => null);
      if (!active || !profile) return;
      const response: Response = await fetch("/api/wishlist").catch((): Response => new Response(null, { status: 500 }));
      if (!active || !response.ok) return;
      const body: { data?: WishlistItem[] } = await response.json().catch(() => ({}));
      const merged: WishlistItem[] = merge(body.data ?? [], useWishlistStore.getState().items);
      useWishlistStore.getState().replace(merged);
      pushWishlist(merged);
      let previous: WishlistItem[] = merged;
      unsubscribe = useWishlistStore.subscribe((state): void => {
        if (state.items === previous) return;
        previous = state.items;
        pushWishlist(state.items);
      });
    };
    void start();
    return (): void => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return null;
}
