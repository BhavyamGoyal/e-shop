import { Badge, Button, Text } from "../atoms";
import { cn } from "@/lib/cn";
import type { AddressRecord } from "@/server/types/address.types";

interface AddressCardProps {
  address: AddressRecord;
  selected?: boolean;
  onSelect?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMakeDefault: () => void;
}

export function AddressCard({ address, selected = false, onSelect, onEdit, onDelete, onMakeDefault }: AddressCardProps) {
  const lines: string = [address.line1, address.line2, address.landmark].filter(Boolean).join(", ");
  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-(--pp-card) p-4",
        selected ? "border-primary ring-2 ring-primary/30" : "border-(--pp-line)",
      )}
    >
      <div className="flex items-start gap-3">
        {onSelect && (
          <input
            type="radio"
            name="delivery-address"
            checked={selected}
            onChange={onSelect}
            aria-label={`Deliver to ${address.label}`}
            className="mt-1 size-4 accent-primary"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{address.label}</span>
            {address.isDefault && <Badge>Default</Badge>}
            {address.location && <Badge tone="secondary">GPS pinned</Badge>}
          </div>
          <Text className="text-sm">{address.fullName} · {address.phone}</Text>
          <Text tone="muted" className="text-sm">
            {lines}, {address.city}, {address.state} {address.postalCode}
          </Text>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" tone="secondary" onClick={onEdit}>Edit</Button>
        {!address.isDefault && (
          <Button size="sm" variant="outline" tone="secondary" onClick={onMakeDefault}>Make default</Button>
        )}
        <Button size="sm" variant="ghost" onClick={onDelete}>Delete</Button>
      </div>
    </li>
  );
}
