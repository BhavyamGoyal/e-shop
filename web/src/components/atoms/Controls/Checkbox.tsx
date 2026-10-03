"use client";

import type { CheckboxProps } from "@/components/atoms/Controls/Checkbox.types";

export function Checkbox({ checked, indeterminate = false, onChange, label, disabled = false }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      ref={(node) => {
        if (node) node.indeterminate = indeterminate;
      }}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      aria-label={label}
      className="size-4 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
