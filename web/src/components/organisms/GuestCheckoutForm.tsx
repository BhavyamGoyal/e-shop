"use client";

import type { ChangeEvent } from "react";
import { FormField } from "../molecules";
import type { GuestAddress, GuestCheckout } from "@/server/types/order.types";

interface GuestCheckoutFormProps {
  value: GuestCheckout;
  onChange: (value: GuestCheckout) => void;
  loginNext: string;
}

type Extra = { inputMode?: "numeric" | "tel" | "email"; maxLength?: number; type?: string; autoComplete?: string };

export function GuestCheckoutForm({ value, onChange, loginNext }: GuestCheckoutFormProps) {
  const contact = (key: "email" | "phone", label: string, extra: Extra) => (
    <FormField
      id={`guest-${key}`}
      label={label}
      value={value[key]}
      required
      onChange={(event: ChangeEvent<HTMLInputElement>): void => onChange({ ...value, [key]: event.target.value })}
      {...extra}
    />
  );

  const address = (key: keyof GuestAddress, label: string, required: boolean, extra: Extra = {}) => (
    <FormField
      id={`guest-${key}`}
      label={label}
      value={value.address[key]}
      required={required}
      onChange={(event: ChangeEvent<HTMLInputElement>): void =>
        onChange({ ...value, address: { ...value.address, [key]: event.target.value } })
      }
      {...extra}
    />
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Contact &amp; delivery</h2>
        <a href={`/login?next=${encodeURIComponent(loginNext)}`} className="text-sm font-medium text-primary hover:underline">
          Have an account? Log in
        </a>
      </div>
      <div className="grid gap-4 rounded-2xl border border-(--pp-line) bg-(--pp-card) p-4 md:grid-cols-2 md:p-5">
        {contact("email", "Email", { type: "email", inputMode: "email", autoComplete: "email" })}
        {contact("phone", "Mobile number", { inputMode: "tel", maxLength: 15, autoComplete: "tel" })}
        {address("fullName", "Full name", true, { autoComplete: "name" })}
        {address("postalCode", "PIN code", true, { inputMode: "numeric", maxLength: 6 })}
        {address("line1", "Flat, house no., building", true)}
        {address("line2", "Area, street, locality", false)}
        {address("landmark", "Landmark (optional)", false)}
        {address("city", "City", true)}
        {address("state", "State", true)}
      </div>
    </section>
  );
}
