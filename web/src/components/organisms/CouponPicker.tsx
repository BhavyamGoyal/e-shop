import { formatPaise } from "@/lib/format-price";
import type { UserCouponView } from "@/server/types/coupon.types";
import { Select } from "../atoms/Controls/Select";

interface CouponPickerProps {
  coupons: UserCouponView[];
  selected: string;
  onSelect: (code: string) => void;
}

export function CouponPicker({ coupons, selected, onSelect }: CouponPickerProps) {
  const current: UserCouponView | undefined = coupons.find((coupon: UserCouponView): boolean => coupon.code === selected);
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <label htmlFor="coupon-select" className="font-semibold">
        Coupon
      </label>
      <Select
        id="coupon-select"
        value={selected}
        placeholder="No coupon"
        options={coupons.map((coupon: UserCouponView) => ({
          value: coupon.code,
          label: `${coupon.code} - ${formatPaise(coupon.discountAmount)} off`,
        }))}
        onChange={(event): void => onSelect(event.target.value)}
      />
      {current ? (
        <span className="text-(--pp-muted)">
          {current.description} ({current.usesRemaining} {current.usesRemaining === 1 ? "use" : "uses"} left)
        </span>
      ) : null}
    </div>
  );
}
