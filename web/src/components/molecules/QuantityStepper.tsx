interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
}

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

const buttonClass = "w-11 self-stretch text-xl text-(--pp-ink) transition-colors hover:text-(--pp-green)";

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
  const set = (next: number): void => onChange(Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, next)));
  return (
    <div className="flex items-center rounded-[14px] border border-(--pp-line) bg-(--pp-card)">
      <button type="button" aria-label="Decrease quantity" onClick={(): void => set(value - 1)} className={buttonClass}>
        −
      </button>
      <span className="w-10 text-center font-semibold" aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label="Increase quantity" onClick={(): void => set(value + 1)} className={buttonClass}>
        +
      </button>
    </div>
  );
}
