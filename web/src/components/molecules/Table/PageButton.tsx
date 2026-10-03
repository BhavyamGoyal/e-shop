import type { PageButtonProps } from "@/components/molecules/Table/PageButton.types";

export function PageButton({ active = false, disabled = false, ariaLabel, ariaCurrent = false, onSelect, children }: PageButtonProps) {
  const base = "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md border px-2 text-xs font-semibold transition-colors";
  const stateClass = active ? "bg-primary text-primary-foreground border-primary" : "bg-surface text-foreground border-border hover:bg-muted";
  const disabledClass = disabled ? "pointer-events-none opacity-50" : "cursor-pointer";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-current={ariaCurrent ? "page" : undefined}
      disabled={disabled}
      onClick={onSelect}
      className={`${base} ${stateClass} ${disabledClass}`}
    >
      {children}
    </button>
  );
}
