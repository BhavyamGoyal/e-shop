"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cart/Cart.store";
import type { CartItem } from "@/stores/cart/Cart.types";

const pushCart = (items: CartItem[]): void => {
  void fetch("/api/cart", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).catch((): void => undefined);
};

export function CartSync() {
  useEffect(() => {
    const initial: CartItem[] = useCartStore.getState().items;
    if (initial.length) pushCart(initial);
    let previous: CartItem[] = initial;
    return useCartStore.subscribe((state): void => {
      if (state.items === previous) return;
      previous = state.items;
      pushCart(state.items);
    });
  }, []);

  return null;
}
