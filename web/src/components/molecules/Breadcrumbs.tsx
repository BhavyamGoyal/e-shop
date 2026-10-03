export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-[#191a0b]">
              {item.label}
            </a>
          ) : (
            <span className="max-w-[26ch] truncate text-[#191a0b]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
