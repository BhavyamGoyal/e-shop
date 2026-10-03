import { cn } from "@/lib/cn";
import type { SpinnerProps, SpinnerSize } from "@/components/atoms/Feedback/Spinner.types";

const SPINNER_SIZE: Record<SpinnerSize, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-9 border-[3px]",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      aria-hidden
      className={cn("inline-block animate-spin rounded-full border-muted border-t-primary", SPINNER_SIZE[size], className)}
    />
  );
}
