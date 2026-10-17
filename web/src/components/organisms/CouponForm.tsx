"use client";

import { useState, type FormEvent } from "react";
import type { CouponInput } from "@/server/types/coupon.types";
import { Button } from "../atoms";
import { FormField } from "../molecules";

export interface CouponFormProps {
  formId: string;
  initial: CouponInput;
  submitLabel: string;
  onSubmit: (input: CouponInput) => Promise<boolean>;
  onCancel?: () => void;
  resetOnSuccess?: boolean;
}

export function CouponForm({ formId, initial, submitLabel, onSubmit, onCancel, resetOnSuccess }: CouponFormProps) {
  const [input, setInput] = useState<CouponInput>(initial);
  const [busy, setBusy] = useState<boolean>(false);

  const change = (patch: Partial<CouponInput>): void =>
    setInput((current: CouponInput): CouponInput => ({ ...current, ...patch }));

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    const ok: boolean = await onSubmit(input);
    setBusy(false);
    if (ok && resetOnSuccess) setInput(initial);
  };

  const valid: boolean =
    input.code.trim().length >= 3 && input.description.trim().length > 0 && input.discountAmount >= 1 && input.usageLimit >= 1;

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4 rounded-md border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`${formId}-code`}
          label="Code"
          required
          value={input.code}
          onChange={(e) => change({ code: e.target.value.toUpperCase() })}
        />
        <FormField
          id={`${formId}-description`}
          label="Description"
          required
          value={input.description}
          onChange={(e) => change({ description: e.target.value })}
        />
        <FormField
          id={`${formId}-amount`}
          label="Discount amount (₹)"
          type="number"
          min={1}
          step="0.01"
          value={input.discountAmount / 100}
          onChange={(e) => change({ discountAmount: Math.round(Number(e.target.value) * 100) })}
        />
        <FormField
          id={`${formId}-limit`}
          label="Uses per user"
          type="number"
          min={1}
          step={1}
          hint="Assigning the coupon to a user again resets their uses to this number."
          value={input.usageLimit}
          onChange={(e) => change({ usageLimit: Math.trunc(Number(e.target.value)) })}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !valid}>
          {busy ? "Saving..." : submitLabel}
        </Button>
        {onCancel ? (
          <Button variant="outline" tone="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
