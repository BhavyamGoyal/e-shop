import { cn } from "@/lib/cn";

export type ArrowDirection = "left" | "right";

export interface ArrowButtonProps {
  direction: ArrowDirection;
  onClick: () => void;
  className?: string;
}

const glyph: Record<ArrowDirection, string> = { left: "←", right: "→" };
const label: Record<ArrowDirection, string> = { left: "Previous", right: "Next" };

export function ArrowButton({ direction, onClick, className }: ArrowButtonProps) {
  return (
    <button
      type="button"
      aria-label={label[direction]}
      onClick={onClick}
      className={cn(
        "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-background/90 text-foreground shadow transition hover:bg-background",
        className,
      )}
    >
      {glyph[direction]}
    </button>
  );
}
