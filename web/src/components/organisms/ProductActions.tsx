"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QuantityStepper } from "../molecules";
import { useCartStore } from "@/stores/cart/Cart.store";
import type { CartItem } from "@/stores/cart/Cart.types";

interface ProductActionsProps {
  inStock: boolean;
  customizeHref?: string | null;
  item: Omit<CartItem, "quantity">;
}

const ADDED_MESSAGE_MS = 1800;

export function ProductActions({ inStock, item, customizeHref = null }: ProductActionsProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const add = useCartStore((state) => state.add);
  const router = useRouter();

  const addToCart = (): void => {
    add({ ...item, quantity });
    setAdded(true);
    window.setTimeout((): void => setAdded(false), ADDED_MESSAGE_MS);
  };

  const share = async (): Promise<void> => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, url });
      } catch {
        return;
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout((): void => setCopied(false), ADDED_MESSAGE_MS);
  };

  const buyNow = (): void => {
    add({ ...item, quantity });
    router.push("/cart");
  };

  if (customizeHref) {
    return (
      <Link
        href={customizeHref}
        aria-disabled={!inStock}
        className={`flex min-h-14 items-center justify-center rounded-[14px] border border-warning/50 bg-linear-to-b from-primary to-(--pp-green-d) text-[17px] font-bold text-primary-foreground shadow-lg transition hover:brightness-110 ${inStock ? "" : "pointer-events-none opacity-50"}`}
      >
        {inStock ? "Customize" : "Sold out"}
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-stretch gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <button
          type="button"
          disabled={!inStock}
          onClick={addToCart}
          className="min-h-11 flex-1 rounded-[14px] border-[1.6px] border-(--pp-green) bg-(--pp-card) text-base font-semibold text-(--pp-green) transition hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-md disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:translate-y-0 disabled:hover:bg-(--pp-card) disabled:hover:shadow-none md:min-h-12"
        >
          {!inStock ? "Sold out" : added ? "Added ✓" : "Add to cart"}
        </button>
        <button
          type="button"
          aria-label={copied ? "Link copied" : "Share"}
          title={copied ? "Link copied" : "Share"}
          onClick={share}
          className="flex w-11 items-center justify-center rounded-[14px] border border-(--pp-line) bg-(--pp-card) text-(--pp-ink) transition hover:text-(--pp-green) md:w-12"
        >
          {copied ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
            </svg>
          )}
        </button>
      </div>
      <button
        type="button"
        disabled={!inStock}
        onClick={buyNow}
        className="min-h-12 rounded-[14px] border border-warning/50 bg-linear-to-b from-primary to-(--pp-green-d) text-base font-bold text-primary-foreground shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buy it now
      </button>
    </div>
  );
}
