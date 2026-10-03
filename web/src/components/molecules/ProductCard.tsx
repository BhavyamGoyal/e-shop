import type { Product } from "@/lib/website-data";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <a href={product.href} className="group block">
      <div className="relative overflow-hidden rounded-[12px] bg-neutral-100" style={{ aspectRatio: 0.8 }}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          type="button"
          aria-label="wishlist"
          className="absolute top-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#191a0b" strokeWidth="2">
            <path d="M12.1 21.35l-1.1-1.02C5.14 15.36 2 12.5 2 8.99 2 6.1 4.24 4 7.05 4c1.6 0 3.14.75 4.15 1.94A5.4 5.4 0 0 1 15.35 4C18.16 4 20.4 6.1 20.4 8.99c0 3.51-3.14 6.37-8.99 11.35l-1.1 1.01z" />
          </svg>
        </button>
        <span className="absolute right-2.5 bottom-2.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#e11d48] shadow">
          ADD
        </span>
      </div>
      <div className="mt-2.5 line-clamp-2 text-sm leading-snug font-medium text-[#191a0b]">{product.name}</div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-base font-bold text-[#191a0b]">₹{product.price}</span>
        {product.mrp !== undefined && (
          <span className="text-[13px] text-neutral-400 line-through">₹{product.mrp}</span>
        )}
        {product.discountLabel && (
          <span className="text-xs font-semibold text-[#2f9e44]">{product.discountLabel}</span>
        )}
      </div>
    </a>
  );
}
