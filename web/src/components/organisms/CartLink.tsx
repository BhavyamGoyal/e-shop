"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { cartCount, useCartStore } from "@/stores/cart/Cart.store";

interface CartLinkProps {
  href: string;
  icon: string;
  label: string;
}

export function CartLink({ href, icon, label }: CartLinkProps) {
  const hydrated: boolean = useHydrated();
  const count: number = useCartStore((state) => cartCount(state.items));
  return (
    <a href={href} className="flex flex-col items-center gap-1 px-1 text-muted-foreground hover:text-foreground">
      <span className="relative">
        <img src={icon} alt={label} width={24} height={24} />
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
