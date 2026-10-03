import { cn } from "@/lib/cn";
import type { ErrorStateProps } from "@/components/molecules/States/ErrorState.types";

export function ErrorState({ title = "Oops!", message, className }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-10 text-center", className)}>
      <svg viewBox="0 0 160 140" className="size-32 text-danger" aria-hidden>
        <ellipse cx="80" cy="124" rx="46" ry="6" fill="currentColor" opacity="0.18" />
        <path d="M 50 32 L 50 22 M 50 18 L 50 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <path d="M 80 26 L 80 14 M 80 10 L 80 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <path d="M 110 32 L 110 22 M 110 18 L 110 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
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
        <path d="M 58 96 L 66 104 M 66 96 L 58 104" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 94 96 L 102 104 M 102 96 L 94 104" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="80" cy="112" rx="5" ry="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
