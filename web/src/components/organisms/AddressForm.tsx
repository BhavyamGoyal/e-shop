"use client";

import dynamic from "next/dynamic";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "../atoms";
import { AlertMessage, CheckField, FormField } from "../molecules";
import type { AddressInput, AddressRecord } from "@/server/types/address.types";

const LocationPicker = dynamic(() => import("./LocationPicker").then((module) => module.LocationPicker), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />,
});

interface AddressFormProps {
  initial: AddressRecord | null;
  onSubmit: (input: AddressInput) => Promise<void>;
  onCancel: () => void;
}

type TextKey = "label" | "fullName" | "phone" | "line1" | "line2" | "landmark" | "city" | "state" | "postalCode";

const EMPTY: AddressInput = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  location: null,
  isDefault: false,
};

const toDraft = (address: AddressRecord | null): AddressInput => (address ? { ...address } : EMPTY);

export function AddressForm({ initial, onSubmit, onCancel }: AddressFormProps) {
  const [draft, setDraft] = useState<AddressInput>(toDraft(initial));
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const field = (key: TextKey, label: string, extra: { required?: boolean; inputMode?: "numeric" | "tel"; maxLength?: number } = {}) => (
    <FormField
      id={`address-${key}`}
      label={label}
      value={draft[key]}
      onChange={(event: ChangeEvent<HTMLInputElement>): void => setDraft({ ...draft, [key]: event.target.value })}
      {...extra}
    />
  );

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSubmit(draft);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not save address");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(event: FormEvent): void => void submit(event)} className="flex flex-col gap-4 rounded-2xl border border-(--pp-line) bg-(--pp-card) p-4 md:p-5">
      <div className="grid gap-4 md:grid-cols-2">
        {field("fullName", "Full name", { required: true })}
        {field("phone", "Mobile number", { required: true, inputMode: "tel", maxLength: 15 })}
        {field("line1", "Flat, house no., building", { required: true })}
        {field("line2", "Area, street, locality")}
        {field("landmark", "Landmark (optional)")}
        {field("postalCode", "PIN code", { required: true, inputMode: "numeric", maxLength: 6 })}
        {field("city", "City", { required: true })}
        {field("state", "State", { required: true })}
        {field("label", "Save as (Home, Work...)", { required: true, maxLength: 30 })}
      </div>
      <LocationPicker value={draft.location} onChange={(location): void => setDraft((current) => ({ ...current, location }))} />
      <CheckField
        label="Make this my default address"
        checked={draft.isDefault || (initial?.isDefault ?? false)}
        disabled={initial?.isDefault ?? false}
        onChange={(event: ChangeEvent<HTMLInputElement>): void => setDraft({ ...draft, isDefault: event.target.checked })}
      />
      {error && <AlertMessage tone="danger" message={error} />}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save address"}</Button>
        <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
      </div>
    </form>
  );
}
