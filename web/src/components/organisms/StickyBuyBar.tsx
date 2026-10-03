interface StickyBuyBarProps {
  title: string;
  image: string | null;
  price: number;
  inStock: boolean;
}

export function StickyBuyBar({ title, image, price, inStock }: StickyBuyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-(--pp-line) bg-[#fffdf9f0] px-3.5 py-2.5 shadow-[0_-8px_24px_-12px_#2d281447] backdrop-blur-md lg:hidden">
      {image && (
        <img src={image} alt="" className="h-11 w-11 shrink-0 rounded-[10px] border border-(--pp-line-soft) object-cover" />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] text-(--pp-muted)">{title}</span>
        <span className="text-base font-bold text-(--pp-green)">₹{price.toLocaleString("en-IN")}</span>
      </div>
      <button
        type="button"
        disabled={!inStock}
        className="min-h-12 shrink-0 rounded-full bg-linear-to-b from-[#4d6a88] to-(--pp-green-d) px-6 text-[15px] font-semibold text-white shadow-[0_6px_16px_#4058704d] disabled:opacity-50"
      >
        {inStock ? "Buy now" : "Sold out"}
      </button>
    </div>
  );
}
