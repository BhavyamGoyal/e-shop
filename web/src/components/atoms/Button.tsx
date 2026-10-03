import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { toneOutline, toneSolid, type Tone } from "./tone";

export type ButtonVariant = "solid" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const variantClasses: Record<ButtonVariant, (tone: Tone) => string> = {
  solid: (tone) => toneSolid[tone],
  outline: (tone) => toneOutline[tone],
  ghost: () => "text-foreground hover:bg-muted",
};

export function Button({
  tone = "primary",
  variant = "solid",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition",
        "hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant](tone),
        className,
      )}
      {...props}
    />
  );
}
