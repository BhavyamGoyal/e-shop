import { MAX_QUANTITY, MIN_QUANTITY } from "@/stores/cart/Cart.store";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
}

const buttonClass = "w-8 self-stretch text-base text-(--pp-ink) transition-colors hover:text-(--pp-green)";

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
  const set = (next: number): void => onChange(Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, next)));
  return (
    <div className="flex items-center rounded-xl border border-(--pp-line) bg-(--pp-card) text-sm">
      <button type="button" aria-label="Decrease quantity" onClick={(): void => set(value - 1)} className={buttonClass}>
        −
      </button>
      <span className="w-7 text-center font-semibold" aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label="Increase quantity" onClick={(): void => set(value + 1)} className={buttonClass}>
        +
      </button>
    </div>
  );
}
