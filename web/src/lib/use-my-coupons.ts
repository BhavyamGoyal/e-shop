import { useEffect, useState } from "react";
import { fetchMyCoupons } from "@/lib/coupon-api";
import type { UserCouponView } from "@/server/types/coupon.types";

export function useMyCoupons(refreshKey: string): UserCouponView[] {
  const [coupons, setCoupons] = useState<UserCouponView[]>([]);

  useEffect((): void => {
    fetchMyCoupons()
      .then(setCoupons)
      .catch((): void => setCoupons([]));
  }, [refreshKey]);

  return coupons;
}
