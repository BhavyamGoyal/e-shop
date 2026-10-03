interface ProductPriceProps {
  price: number;
  compareAtPrice: number | null;
}

const formatPrice = (value: number): string => `₹${value.toLocaleString("en-IN")}`;

export function ProductPrice({ price, compareAtPrice }: ProductPriceProps) {
  const onSale: boolean = compareAtPrice !== null && compareAtPrice > price;
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2.5">
        <span className="text-[30px] font-bold tracking-tight text-(--pp-green)">{formatPrice(price)}</span>
        {onSale && compareAtPrice !== null && (
          <>
            <s className="text-lg text-(--pp-muted)">{formatPrice(compareAtPrice)}</s>
            <span className="rounded-full bg-[#e0a93f38] px-2.5 py-0.5 text-[13px] font-bold text-[#7a5410]">
              {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}% OFF
            </span>
          </>
        )}
      </div>
      <p className="mt-1 text-[13px] text-(--pp-muted)">Inclusive of all taxes</p>
    </div>
  );
}
