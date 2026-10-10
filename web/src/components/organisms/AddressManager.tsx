"use client";

import { useEffect, useState } from "react";
import { Button, Text } from "../atoms";
import { AddressCard, AlertMessage } from "../molecules";
import { AddressForm } from "./AddressForm";
import { useAddresses, type AddressesState } from "@/lib/use-addresses";
import type { AddressInput, AddressRecord } from "@/server/types/address.types";

interface AddressManagerProps {
  selectedId?: string;
  onSelect?: (id: string) => void;
  loginNext: string;
}

type Editing = AddressRecord | "new" | null;

export function AddressManager({ selectedId, onSelect, loginNext }: AddressManagerProps) {
  const state: AddressesState = useAddresses();
  const [editing, setEditing] = useState<Editing>(null);
  const { addresses, loading } = state;

  useEffect((): void => {
    if (!onSelect || loading) return;
    if (addresses.some((address: AddressRecord): boolean => address.id === selectedId)) return;
    const fallback: AddressRecord | undefined = addresses.find((address: AddressRecord): boolean => address.isDefault) ?? addresses[0];
    if (fallback) onSelect(fallback.id);
  }, [addresses, loading, selectedId, onSelect]);

  if (loading) return <div className="h-24 animate-pulse rounded-2xl bg-muted" aria-busy />;

  if (state.authRequired) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-(--pp-line) bg-(--pp-card) p-5">
        <Text>Log in to add and manage your delivery addresses.</Text>
        <a href={`/login?next=${encodeURIComponent(loginNext)}`} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Log in
        </a>
      </div>
    );
  }

  const submit = async (input: AddressInput): Promise<void> => {
    const saved: AddressRecord = await state.save(editing === "new" || editing === null ? null : editing.id, input);
    if (editing === "new") onSelect?.(saved.id);
    setEditing(null);
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{onSelect ? "Delivery address" : "Your addresses"}</h2>
        {editing === null && <Button size="sm" variant="outline" tone="secondary" onClick={(): void => setEditing("new")}>Add address</Button>}
      </div>
      {state.error && <AlertMessage tone="danger" message={state.error} />}
      {editing !== null && (
        <AddressForm key={editing === "new" ? "new" : editing.id} initial={editing === "new" ? null : editing} onSubmit={submit} onCancel={(): void => setEditing(null)} />
      )}
      {addresses.length === 0 && editing === null && <Text tone="muted">You have no saved addresses yet.</Text>}
      <ul className="flex flex-col gap-3">
        {addresses.map((address: AddressRecord) => (
          <AddressCard
            key={address.id}
            address={address}
            selected={onSelect ? address.id === selectedId : false}
            onSelect={onSelect ? (): void => onSelect(address.id) : undefined}
            onEdit={(): void => setEditing(address)}
            onDelete={(): void => void state.remove(address.id)}
            onMakeDefault={(): void => void state.makeDefault(address)}
          />
        ))}
      </ul>
    </section>
  );
}
