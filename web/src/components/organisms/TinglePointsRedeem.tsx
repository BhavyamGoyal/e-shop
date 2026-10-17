import { formatPrice } from "@/lib/format-price";

interface TinglePointsRedeemProps {
  balance: number;
  maxPoints: number;
  applied: boolean;
  onToggle: (applied: boolean) => void;
}

export function TinglePointsRedeem({ balance, maxPoints, applied, onToggle }: TinglePointsRedeemProps) {
  const usable: boolean = maxPoints > 0;
  return (
    <label className="flex items-start gap-3 rounded-xl border border-(--pp-line) p-3 text-sm">
      <input
        type="checkbox"
        checked={applied && usable}
        disabled={!usable}
        onChange={(event): void => onToggle(event.target.checked)}
        className="mt-1"
      />
      <span className="flex flex-col gap-0.5">
        <span className="font-semibold">Use Tingle Points</span>
        <span className="text-(--pp-muted)">
          You have {balance} {balance === 1 ? "point" : "points"}. 1 point = {formatPrice(1)}.
        </span>
        <span className="text-(--pp-muted)">
          {usable
            ? `Use up to ${maxPoints} on this order (max 15% of the total).`
            : "No points can be used on this order yet."}
        </span>
      </span>
    </label>
  );
}
