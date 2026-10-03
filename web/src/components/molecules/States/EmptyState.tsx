import { cn } from "@/lib/cn";
import type { EmptyStateProps } from "@/components/molecules/States/EmptyState.types";

export function EmptyState({ title = "Nothing here yet", message = "No data available.", className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-10 text-center", className)}>
      <svg viewBox="0 0 160 140" className="size-32 text-muted-foreground" aria-hidden>
        <ellipse cx="80" cy="124" rx="46" ry="6" fill="currentColor" opacity="0.18" />
        <path
          d="M 30 70 L 80 50 L 130 70 L 130 112 Q 130 118 124 118 L 36 118 Q 30 118 30 112 Z"
          fill="currentColor"
          opacity="0.12"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M 30 70 L 80 90 L 130 70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M 80 50 L 80 90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="64" cy="100" r="3" fill="currentColor" />
        <circle cx="96" cy="100" r="3" fill="currentColor" />
        <path d="M 68 112 Q 80 106 92 112" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 50 40 L 50 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M 80 32 L 80 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M 110 40 L 110 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
