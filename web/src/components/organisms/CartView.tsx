"use client";

import Link from "next/link";
import { CartLine } from "../molecules";
import { EmptyState } from "../molecules/States/EmptyState";
import { useHydrated } from "@/hooks/useHydrated";
import { formatPrice } from "@/lib/format-price";
import { cartCount, useCartStore } from "@/stores/cart/Cart.store";
import type { CartItem } from "@/stores/cart/Cart.types";

const subtotalOf = (items: CartItem[]): number =>
  items.reduce((total: number, item: CartItem): number => total + item.price * item.quantity, 0);

const lineSavings = (item: CartItem): number =>
  item.compareAtPrice !== null && item.compareAtPrice > item.price
    ? (item.compareAtPrice - item.price) * item.quantity
    : 0;

const savingsOf = (items: CartItem[]): number =>
  items.reduce((total: number, item: CartItem): number => total + lineSavings(item), 0);

export function CartView() {
  const hydrated: boolean = useHydrated();
  const items: CartItem[] = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);

  if (!hydrated) return <div className="h-64" aria-busy />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <EmptyState title="Your cart is empty" message="Add something you love and it will show up here." />
        <Link
          href="/"
          className="rounded-[14px] bg-linear-to-b from-primary to-(--pp-green-d) px-8 py-3 font-semibold text-primary-foreground shadow-md hover:brightness-110"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const savings: number = savingsOf(items);
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <ul className="flex flex-col gap-4">
        {items.map((item: CartItem) => (
          <CartLine
            key={item.key}
            item={item}
            onQuantity={(quantity: number): void => setQuantity(item.key, quantity)}
            onRemove={(): void => remove(item.key)}
          />
        ))}
      </ul>
      <aside className="flex flex-col gap-4 rounded-2xl border border-(--pp-line) bg-(--pp-card) p-5 lg:sticky lg:top-[100px]">
        <h2 className="text-xl font-semibold">Order summary</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-(--pp-muted)">Items</dt>
            <dd>{cartCount(items)}</dd>
          </div>
          {savings > 0 && (
            <div className="flex justify-between">
              <dt className="text-(--pp-muted)">You save</dt>
              <dd className="font-medium text-(--pp-green)">{formatPrice(savings)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-(--pp-line) pt-3 text-base font-bold">
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotalOf(items))}</dd>
          </div>
        </dl>
        <p className="text-xs text-(--pp-muted)">Inclusive of all taxes. Shipping is calculated at checkout.</p>
        <button
          type="button"
          disabled
          className="min-h-12 rounded-[14px] bg-linear-to-b from-primary to-(--pp-green-d) font-semibold text-primary-foreground shadow-md disabled:opacity-50"
        >
          Checkout coming soon
        </button>
        <button type="button" onClick={clear} className="text-sm font-medium text-(--pp-muted) hover:text-danger">
          Clear cart
        </button>
      </aside>
    </div>
  );
}
