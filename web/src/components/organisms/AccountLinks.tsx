import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AccountLink {
  href: string;
  label: string;
  icon: ReactNode;
}

interface AccountLinksProps {
  onNavigate?: () => void;
  current?: string;
  className?: string;
}

const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ACCOUNT_LINKS: AccountLink[] = [
  {
    href: "/account",
    label: "Your account",
    icon: (
      <svg {...svgProps}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M10 21v-6h4v6" />
      </svg>
    ),
  },
  {
    href: "/account/profile",
    label: "My profile",
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    href: "/account/orders",
    label: "My orders",
    icon: (
      <svg {...svgProps}>
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
        <path d="m3 8 9 5 9-5" />
        <path d="M12 13v8" />
      </svg>
    ),
  },
  {
    href: "/account/addresses",
    label: "My addresses",
    icon: (
      <svg {...svgProps}>
        <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.800 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
    ),
  },
];

export function AccountLinks({ onNavigate, current, className }: AccountLinksProps) {
  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {ACCOUNT_LINKS.map((link: AccountLink) => (
        <a
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          aria-current={link.href === current ? "page" : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap text-surface-foreground transition-colors hover:bg-muted",
            link.href === current && "bg-primary/10 text-primary",
          )}
        >
          <span
            className={cn(
              "flex size-8 items-center justify-center text-muted-foreground transition-colors group-hover:text-primary",
              link.href === current && "text-primary",
            )}
          >
            {link.icon}
          </span>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
