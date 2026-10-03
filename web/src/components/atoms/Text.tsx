import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type TextTone = "default" | "muted";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  tone?: TextTone;
}

const toneClasses: Record<TextTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
};

export function Text({ tone = "default", className, ...props }: TextProps) {
  return <p className={cn(toneClasses[tone], className)} {...props} />;
}
