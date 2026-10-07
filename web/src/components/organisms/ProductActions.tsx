"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuantityStepper } from "../molecules";
import { useCartStore } from "@/stores/cart/Cart.store";
import type { CartItem } from "@/stores/cart/Cart.types";

interface ProductActionsProps {
  inStock: boolean;
  item: Omit<CartItem, "quantity">;
}

const ADDED_MESSAGE_MS = 1800;

export function ProductActions({ inStock, item }: ProductActionsProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);
  const add = useCartStore((state) => state.add);
  const router = useRouter();

  const addToCart = (): void => {
    add({ ...item, quantity });
    setAdded(true);
    window.setTimeout((): void => setAdded(false), ADDED_MESSAGE_MS);
  };

  const buyNow = (): void => {
    add({ ...item, quantity });
    router.push("/cart");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-stretch gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <button
          type="button"
          disabled={!inStock}
          onClick={addToCart}
          className="min-h-[52px] flex-1 rounded-[14px] border-[1.6px] border-(--pp-green) bg-(--pp-card) text-base font-semibold text-(--pp-green) transition hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-md disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:translate-y-0 disabled:hover:bg-(--pp-card) disabled:hover:shadow-none md:min-h-[58px]"
        >
          {!inStock ? "Sold out" : added ? "Added ✓" : "Add to cart"}
        </button>
      </div>
      <button
        type="button"
        disabled={!inStock}
        onClick={buyNow}
        className="min-h-14 rounded-[14px] border border-warning/50 bg-linear-to-b from-primary to-(--pp-green-d) text-[17px] font-bold text-primary-foreground shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buy it now
      </button>
    </div>
  );
}
