import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type HeadingLevel = 1 | 2 | 3;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
}

const levelClasses: Record<HeadingLevel, string> = {
  1: "text-4xl font-bold tracking-tight sm:text-5xl",
  2: "text-2xl font-semibold tracking-tight",
  3: "text-lg font-semibold",
};

export function Heading({ level = 2, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={cn("text-foreground", levelClasses[level], className)} {...props} />;
}
