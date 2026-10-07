import { formatPrice } from "@/lib/format-price";
import type { CartItem } from "@/stores/cart/Cart.types";
import { QuantityStepper } from "./QuantityStepper";

interface CartLineProps {
  item: CartItem;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartLine({ item, onQuantity, onRemove }: CartLineProps) {
  const href: string = `/product/${item.handle}`;
  return (
    <li className="flex gap-4 rounded-2xl border border-(--pp-line) bg-(--pp-card) p-3 md:p-4">
      <a href={href} className="shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.title} className="size-24 rounded-xl object-cover md:size-28" />
        ) : (
          <span className="block size-24 rounded-xl bg-muted md:size-28" />
        )}
      </a>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <a href={href} className="line-clamp-2 font-semibold hover:text-(--pp-green)">
              {item.title}
            </a>
            {item.variantTitle && <p className="text-sm text-(--pp-muted)">{item.variantTitle}</p>}
          </div>
          <span className="shrink-0 font-bold text-(--pp-green)">{formatPrice(item.price * item.quantity)}</span>
        </div>
        <p className="text-sm text-(--pp-muted)">
          {formatPrice(item.price)} each
          {item.compareAtPrice !== null && item.compareAtPrice > item.price && (
            <s className="ml-2">{formatPrice(item.compareAtPrice)}</s>
          )}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3">
          <QuantityStepper value={item.quantity} onChange={onQuantity} />
          <button type="button" onClick={onRemove} className="text-sm font-medium text-danger hover:underline">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
