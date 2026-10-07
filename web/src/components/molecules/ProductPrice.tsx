import { formatPrice } from "@/lib/format-price";

interface ProductPriceProps {
  price: number;
  compareAtPrice: number | null;
}

export function ProductPrice({ price, compareAtPrice }: ProductPriceProps) {
  const onSale: boolean = compareAtPrice !== null && compareAtPrice > price;
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2.5">
        <span className="text-[30px] font-bold tracking-tight text-(--pp-green)">{formatPrice(price)}</span>
        {onSale && compareAtPrice !== null && (
          <>
            <s className="text-lg text-(--pp-muted)">{formatPrice(compareAtPrice)}</s>
            <span className="rounded-full bg-warning/20 px-2.5 py-0.5 text-[13px] font-bold text-warning">
              {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}% OFF
            </span>
          </>
        )}
      </div>
      <p className="mt-1 text-[13px] text-(--pp-muted)">Inclusive of all taxes</p>
    </div>
  );
}
