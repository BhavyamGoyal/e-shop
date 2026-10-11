import type { ReactNode } from "react";
import { Text } from "../atoms";

interface AccountTileProps {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export function AccountTile({ href, title, description, icon }: AccountTileProps) {
  return (
    <a
      href={href}
      className="flex items-start gap-4 rounded-2xl border border-(--pp-line) bg-(--pp-card) p-5 transition hover:border-primary hover:shadow-sm"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">{icon}</span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-lg font-semibold">{title}</span>
        <Text tone="muted" className="text-sm">{description}</Text>
      </span>
    </a>
  );
}
