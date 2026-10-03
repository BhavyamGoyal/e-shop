import { ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon } from "@/components/atoms/Icons";
import type { SortButtonProps } from "@/components/atoms/Table/SortButton.types";

export function SortButton({ label, direction, onClick }: SortButtonProps) {
  return (
    <button type="button" aria-label={`Sort by ${label}`} onClick={onClick} className="shrink-0 cursor-pointer transition-colors hover:text-foreground">
      {direction === "asc" ? (
        <ChevronUpIcon width={12} height={12} />
      ) : direction === "desc" ? (
        <ChevronDownIcon width={12} height={12} />
      ) : (
        <ChevronUpDownIcon width={12} height={12} className="opacity-60" />
      )}
    </button>
  );
}
