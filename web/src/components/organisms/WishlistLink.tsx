"use client";

import { HeartIcon } from "@/components/atoms/Icons/HeartIcon";
import { useHydrated } from "@/hooks/useHydrated";
import { useWishlistStore } from "@/stores/wishlist/Wishlist.store";

interface WishlistLinkProps {
  href: string;
  label: string;
}

export function WishlistLink({ href, label }: WishlistLinkProps) {
  const hydrated: boolean = useHydrated();
  const count: number = useWishlistStore((state) => state.items.length);
  return (
    <a href={href} className="flex flex-col items-center gap-1 px-1 text-muted-foreground hover:text-foreground">
      <span className="relative">
        <HeartIcon width={24} height={24} aria-label={label} />
        {hydrated && count > 0 && (
          <span className="absolute -top-2 -right-2.5 flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4.5 font-semibold text-primary-foreground">
            {count}
          </span>
        )}
      </span>
      <span className="hidden text-xs whitespace-nowrap md:block">{label}</span>
    </a>
  );
}
