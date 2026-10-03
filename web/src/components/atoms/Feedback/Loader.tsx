import { cn } from "@/lib/cn";
import { Spinner } from "@/components/atoms/Feedback/Spinner";
import type { LoaderProps, LoaderSize } from "@/components/atoms/Feedback/Loader.types";

const LABEL_SIZE: Record<LoaderSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
};

export function Loader({ size = "md", label, className }: LoaderProps) {
  return (
    <div role="status" aria-live="polite" aria-label={label ?? "Loading"} className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Spinner size={size} />
      {label ? <span className={cn("font-medium text-muted-foreground", LABEL_SIZE[size])}>{label}</span> : null}
    </div>
  );
}
