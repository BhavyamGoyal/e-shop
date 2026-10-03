"use client";

import { useState } from "react";
import { QuantityStepper } from "../molecules";

interface ProductActionsProps {
  inStock: boolean;
}

export function ProductActions({ inStock }: ProductActionsProps) {
  const [quantity, setQuantity] = useState<number>(1);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-stretch gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <button
          type="button"
          disabled={!inStock}
          className="min-h-[52px] flex-1 rounded-[14px] border-[1.6px] border-(--pp-green) bg-(--pp-card) text-base font-semibold text-(--pp-green) transition hover:-translate-y-0.5 hover:bg-[#2d501612] hover:shadow-[0_10px_22px_-12px_#2d501666] disabled:cursor-not-allowed disabled:border-[#d6d1c5] disabled:text-[#a9a499] disabled:hover:translate-y-0 disabled:hover:bg-(--pp-card) disabled:hover:shadow-none md:min-h-[58px]"
        >
          {inStock ? "Add to cart" : "Sold out"}
        </button>
      </div>
      <button
        type="button"
        disabled={!inStock}
        className="min-h-14 rounded-[14px] border border-[#f0c86980] bg-linear-to-b from-[#41702a] to-[#23400f] text-[17px] font-bold text-white shadow-[0_16px_34px_-10px_#2d50168c,0_2px_10px_-2px_#e0a93f59] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buy it now
      </button>
    </div>
  );
}
