import type { HeaderData } from "@/lib/website-data";
import { ProfileMenu } from "./ProfileMenu";

const PROFILE_HREF = "/login";

interface SiteHeaderProps {
  header: HeaderData;
}

export function SiteHeader({ header }: SiteHeaderProps) {
  const { logo, location, search, actions, nav } = header;
  return (
    <div className="sticky top-0 z-50 w-full bg-background">
      <header className="flex items-center justify-between gap-5 border-b border-border px-6 py-3 md:px-10">
        <a href={logo.href} className="shrink-0">
          <img src="/logo_v1.svg" alt={logo.text} className="block h-12 w-auto" />
        </a>
        <span className="hidden h-10 border-r border-border lg:block" />
        <div className="hidden min-w-[170px] cursor-pointer items-center gap-2 lg:flex">
          <img src={location.icon} alt="location" width={24} height={24} />
          <div>
            <div className="text-base font-semibold text-foreground">{location.title}</div>
            <div className="flex items-center gap-1 text-xs font-medium text-danger">
              {location.status}
              <img src={location.chevron} alt="" width={14} height={14} />
            </div>
          </div>
        </div>
        <form className="hidden max-w-[652px] flex-1 md:block">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <img src={search.icon} alt="search" width={20} height={20} />
            </span>
            <input
              type="text"
              placeholder={search.placeholder}
              className="w-full rounded-lg border border-border bg-muted py-3 pr-4 pl-11 text-sm outline-none focus:border-ring"
            />
          </div>
        </form>
        <div className="flex shrink-0 items-center gap-2 text-xs md:gap-5">
          {actions.map((action) =>
            action.href === PROFILE_HREF ? (
              <ProfileMenu key={action.href} guestIcon={action.icon} />
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
