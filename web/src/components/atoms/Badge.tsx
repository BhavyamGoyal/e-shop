import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { toneSoft, type Tone } from "./tone";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "primary", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneSoft[tone],
        className,
      )}
      {...props}
    />
  );
}
