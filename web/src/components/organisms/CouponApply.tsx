"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { formatPaise } from "@/lib/format-price";
import { couponDiscountPaise } from "@/server/services/coupon-discount";
import type { UserCouponView } from "@/server/types/coupon.types";

interface CouponApplyProps {
  coupons: UserCouponView[];
  payablePaise: number;
  onApply: (code: string) => void;
}

interface Popup {
  valid: boolean;
  text: string;
}

const POPUP_MS = 3000;

export function CouponApply({ coupons, payablePaise, onApply }: CouponApplyProps) {
  const [code, setCode] = useState<string>("");
  const [popup, setPopup] = useState<Popup | null>(null);

  useEffect((): (() => void) | void => {
    if (!popup) return;
    const timer: ReturnType<typeof setTimeout> = setTimeout((): void => setPopup(null), POPUP_MS);
    return (): void => clearTimeout(timer);
  }, [popup]);

  const apply = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const entered: string = code.trim().toUpperCase();
    const match: UserCouponView | undefined = coupons.find(
      (coupon: UserCouponView): boolean => coupon.code.toUpperCase() === entered,
    );
    if (!match) {
      setPopup({ valid: false, text: "This offer is not valid." });
      return;
    }
    onApply(match.code);
    setPopup({ valid: true, text: `Yay! You saved ${formatPaise(couponDiscountPaise(match, payablePaise))}` });
  };

  return (
    <form onSubmit={apply} className="flex flex-col gap-1.5 text-sm">
      <label htmlFor="coupon-code" className="font-semibold">
        Have a coupon?
      </label>
      <div className="flex gap-2">
        <Input
          id="coupon-code"
          value={code}
          placeholder="Enter coupon code"
          onChange={(event): void => setCode(event.target.value)}
        />
        <Button type="submit" disabled={code.trim() === ""}>
          Apply
        </Button>
      </div>
      {popup && (
        <div
          role="status"
          className={
            popup.valid
              ? "fixed right-4 top-4 z-50 rounded-xl border border-(--pp-green) bg-(--pp-card) px-4 py-3 text-sm font-semibold text-(--pp-green) shadow-lg"
              : "fixed right-4 top-4 z-50 rounded-xl border border-red-600 bg-(--pp-card) px-4 py-3 text-sm font-semibold text-red-600 shadow-lg"
          }
        >
          {popup.text}
        </div>
      )}
    </form>
  );
}
