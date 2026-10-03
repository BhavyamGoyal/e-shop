import type { HeaderData } from "@/lib/website-data";

interface SiteHeaderProps {
  header: HeaderData;
}

export function SiteHeader({ header }: SiteHeaderProps) {
  const { logo, location, search, actions, nav } = header;
  return (
    <div className="sticky top-0 z-50 w-full bg-white">
      <header className="flex items-center justify-between gap-5 border-b border-neutral-100 px-6 py-3 md:px-10">
        <a href={logo.href} className="shrink-0">
          <span className="block text-2xl leading-none font-extrabold tracking-tight text-[#191a0b]">{logo.text}</span>
          <span className="block text-[11px] font-medium tracking-wide text-neutral-500">{logo.tagline}</span>
        </a>
        <span className="hidden h-10 border-r border-neutral-200 lg:block" />
        <div className="hidden min-w-[170px] cursor-pointer items-center gap-2 lg:flex">
          <img src={location.icon} alt="location" width={24} height={24} />
          <div>
            <div className="text-base font-semibold text-[#444]">{location.title}</div>
            <div className="flex items-center gap-1 text-xs font-medium text-[#ef4444]">
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
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-3 pr-4 pl-11 text-sm outline-none focus:border-[#191a0b]"
            />
          </div>
        </form>
        <div className="flex shrink-0 items-center gap-2 text-xs md:gap-5">
          {actions.map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-1 px-1 text-neutral-500 hover:text-[#191a0b]"
            >
              <img src={action.icon} alt={action.label} width={24} height={24} />
              <span className="hidden text-xs whitespace-nowrap md:block">{action.label}</span>
            </a>
          ))}
        </div>
      </header>
      {nav.length > 0 && (
      <nav className="hidden justify-center gap-8 border-b border-neutral-100 px-10 py-3 md:flex">
        {nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1.5 text-xs font-medium text-[#191a0b] hover:text-[#2f9e44]"
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
