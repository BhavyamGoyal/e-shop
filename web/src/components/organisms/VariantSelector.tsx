import { cn } from "@/lib/cn";
import type { ProductOption } from "@/server/types/product.types";

interface VariantSelectorProps {
  options: ProductOption[];
  selected: string[];
  onChange: (optionIndex: number, value: string) => void;
}

export function VariantSelector({ options, selected, onChange }: VariantSelectorProps) {
  return (
    <div className="flex flex-col gap-[18px]">
      {options.map((option: ProductOption, optionIndex: number) => (
        <fieldset key={option.name}>
          <legend className="mb-2.5 block text-[13px] font-semibold tracking-[0.01em] text-(--pp-ink)">
            {option.name}: <em className="font-medium text-(--pp-muted) not-italic">{selected[optionIndex]}</em>
          </legend>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value: string) => (
              <button
                key={value}
                type="button"
                onClick={(): void => onChange(optionIndex, value)}
                aria-pressed={selected[optionIndex] === value}
                className={cn(
                  "min-h-11 rounded-full border px-[17px] py-2.5 text-sm font-medium transition hover:-translate-y-px hover:border-(--pp-green-l)",
                  selected[optionIndex] === value
                    ? "border-(--pp-green) bg-linear-to-b from-primary to-(--pp-green-d) text-primary-foreground shadow-(--pp-shadow-sm)"
                    : "border-(--pp-line) bg-(--pp-card) text-(--pp-ink)",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
