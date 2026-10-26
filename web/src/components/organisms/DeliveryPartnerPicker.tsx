import { Select } from "../atoms/Controls/Select";
import type { DeliveryEstimateState } from "@/lib/use-delivery";
import type { DeliveryPartnerOption } from "@/server/types/delivery.types";

interface DeliveryPartnerPickerProps {
  partners: DeliveryPartnerOption[];
  selected: string;
  onSelect: (id: string) => void;
  state: DeliveryEstimateState;
  hasPincode: boolean;
}

const formatDate = (iso: string): string =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

function message({ estimate, loading, error }: DeliveryEstimateState, hasPincode: boolean): string {
  if (!hasPincode) return "Enter a valid PIN code to see the estimated delivery date.";
  if (loading) return "Checking delivery...";
  if (error) return error;
  if (!estimate) return "";
  if (!estimate.serviceable || !estimate.estimatedDate) return "This partner does not deliver to your PIN code.";
  return `Estimated delivery by ${formatDate(estimate.estimatedDate)}`;
}

export function DeliveryPartnerPicker({ partners, selected, onSelect, state, hasPincode }: DeliveryPartnerPickerProps) {
  const unserviceable: boolean = state.estimate !== null && !state.estimate.serviceable;
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <label htmlFor="delivery-partner-select" className="font-semibold">
        Delivery partner
      </label>
      <Select
        id="delivery-partner-select"
        value={selected}
        options={partners.map((partner: DeliveryPartnerOption) => ({ value: partner.id, label: partner.name }))}
        onChange={(event): void => onSelect(event.target.value)}
      />
      <span className={unserviceable || state.error ? "text-red-600" : "text-(--pp-muted)"}>{message(state, hasPincode)}</span>
    </div>
  );
}
