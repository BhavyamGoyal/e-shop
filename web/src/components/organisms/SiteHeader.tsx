import { Fragment } from "react";
import type { HeaderData } from "@/lib/website-data";
import { CartLink } from "./CartLink";
import { HeaderLocation } from "./HeaderLocation";
import { MobileMenu } from "./MobileMenu";
import { MobileSearch } from "./MobileSearch";
import { ProfileMenu } from "./ProfileMenu";
import { SearchBox } from "./SearchBox";
import { WishlistLink } from "./WishlistLink";

const PROFILE_HREF = "/login";
const CART_HREF = "/cart";
const WISHLIST_HREF = "/wishlist";

interface SiteHeaderProps {
  header: HeaderData;
}

export function SiteHeader({ header }: SiteHeaderProps) {
  const { logo, location, search, actions, nav } = header;
  return (
    <div className="sticky top-0 z-50 w-full bg-background">
      <header className="relative flex items-center justify-between gap-5 border-b border-border px-4 py-3 md:px-10">
        <MobileMenu />
        <a href={logo.href} className="absolute left-1/2 shrink-0 -translate-x-1/2 md:static md:translate-x-0">
          <img src="/logo_v1.svg" alt={logo.text} className="block h-12 w-auto" />
        </a>
        <span className="hidden h-10 border-r border-border lg:block" />
        <HeaderLocation location={location} />
        <div className="hidden max-w-[652px] flex-1 md:block">
          <SearchBox icon={search.icon} placeholder={search.placeholder} />
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs md:gap-5">
          <MobileSearch icon={search.icon} placeholder={search.placeholder} />
          {actions.map((action) =>
            action.href === PROFILE_HREF ? (
              <div key={action.href} className="hidden md:block">
                <ProfileMenu guestIcon={action.icon} />
              </div>
            ) : action.href === CART_HREF ? (
              <Fragment key={action.href}>
                <WishlistLink href={WISHLIST_HREF} label="Wishlist" />
                <CartLink href={action.href} icon={action.icon} label={action.label} />
              </Fragment>
            ) : (
            <a
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-1 px-1 text-muted-foreground hover:text-foreground"
            >
              <img src={action.icon} alt={action.label} width={24} height={24} />
              <span className="hidden text-xs whitespace-nowrap md:block">{action.label}</span>
            </a>
            ),
          )}
        </div>
      </header>
      {nav.length > 0 && (
      <nav className="hidden justify-center gap-8 border-b border-border px-10 py-3 md:flex">
        {nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary"
          >
            <img src={item.icon} alt={item.label} width={28} height={28} className="h-9 w-9 rounded-full object-cover" />
            {item.label}
          </a>
        ))}
      </nav>
      )}
    </div>
  );
}
