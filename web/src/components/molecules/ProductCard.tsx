"use client";

import type { MouseEvent } from "react";
import { HeartIcon } from "@/components/atoms/Icons/HeartIcon";
import { useHydrated } from "@/hooks/useHydrated";
import type { Product } from "@/lib/website-data";
import { isWishlisted, useWishlistStore } from "@/stores/wishlist/Wishlist.store";
import type { WishlistItem } from "@/stores/wishlist/Wishlist.types";

interface ProductCardProps {
  product: Product;
}

const PRODUCT_PREFIX = "/product/";

const toWishlistItem = (product: Product): WishlistItem => ({
  handle: product.href.slice(PRODUCT_PREFIX.length),
  title: product.name,
  image: product.image || null,
  price: product.price,
  compareAtPrice: product.mrp ?? null,
});

export function ProductCard({ product }: ProductCardProps) {
  const hydrated: boolean = useHydrated();
  const item: WishlistItem = toWishlistItem(product);
  const wishlisted: boolean = useWishlistStore((state) => isWishlisted(state.items, item.handle));
  const toggle = useWishlistStore((state) => state.toggle);
  const active: boolean = hydrated && wishlisted;

  const onWishlist = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    toggle(item);
  };

  return (
    <a href={product.href} className="group block">
      <div className="relative overflow-hidden rounded-[12px] bg-muted" style={{ aspectRatio: 0.8 }}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
          <button
            type="button"
            aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={active}
            onClick={onWishlist}
            className={`grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-background/90 shadow ${active ? "text-danger" : "text-foreground"}`}
          >
            <HeartIcon width={16} height={16} fill={active ? "currentColor" : "none"} />
          </button>
          <span className="rounded-full bg-background px-3.5 py-1.5 text-xs font-bold text-danger shadow">
            Add To Cart
          </span>
        </div>
      </div>
      <div className="mt-2.5 line-clamp-2 text-sm leading-snug font-medium text-foreground">{product.name}</div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-base font-bold text-foreground">₹{product.price}</span>
        {product.mrp !== undefined && (
          <span className="text-[13px] text-muted-foreground line-through">₹{product.mrp}</span>
        )}
        {product.discountLabel && (
          <span className="text-xs font-semibold text-success">{product.discountLabel}</span>
        )}
      </div>
    </a>
  );
}
