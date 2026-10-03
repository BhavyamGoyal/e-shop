"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { TabbedProductsBlock } from "@/lib/website-data";
import { ScrollRow } from "../molecules";
import { ProductRail } from "./ProductRail";

interface TabbedProductShowcaseProps {
  block: TabbedProductsBlock;
}

export function TabbedProductShowcase({ block }: TabbedProductShowcaseProps) {
  const [active, setActive] = useState(0);
  const tab = block.tabs[active];
  return (
    <div>
      <ScrollRow className="mb-5" scrollerClassName="flex gap-3">
        {block.tabs.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "shrink-0 cursor-pointer rounded-full border px-5 py-2.5 text-sm font-semibold",
              index === active
                ? "border-[#191a0b] bg-[#191a0b] text-white"
                : "border-neutral-200 bg-white text-[#191a0b]",
            )}
          >
            {item.label}
          </button>
        ))}
      </ScrollRow>
      {tab && <ProductRail products={tab.products} gap={24} visible={4.4} />}
    </div>
  );
}
