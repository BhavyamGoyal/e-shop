import type { CSSProperties } from "react";
import { ProductCard, ScrollRow } from "../molecules";
import type { Product } from "@/lib/website-data";

interface ProductRailProps {
  products: Product[];
  gap: number;
  visible: number;
}

const itemWidth = (gap: number, visible: number) =>
  `calc((100% - ${gap}px * ${visible - 1}) / ${visible})`;

export function ProductRail({ products, gap, visible }: ProductRailProps) {
  const style = {
    "--gap": `${gap}px`,
    "--w": itemWidth(gap, visible),
    "--mw": itemWidth(12, 2.3),
  } as CSSProperties;
  return (
    <ScrollRow scrollerClassName="flex gap-3 pb-1 md:gap-(--gap)" scrollerStyle={style}>
      {products.map((product) => (
        <div key={product.href} className="w-(--mw) shrink-0 md:w-(--w)">
          <ProductCard product={product} />
        </div>
      ))}
    </ScrollRow>
  );
}
