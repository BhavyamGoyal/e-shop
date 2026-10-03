import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SwatchProps extends HTMLAttributes<HTMLSpanElement> {
  color: string;
}

export function Swatch({ color, className, style, ...props }: SwatchProps) {
  return (
    <span
      className={cn("inline-block size-4 rounded-full border", className)}
      style={{ backgroundColor: color, ...style }}
      {...props}
    />
  );
}
