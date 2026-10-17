"use client";

import { useCallback, useEffect, useState } from "react";
import type { CouponInput, CouponListData } from "@/server/types/coupon.types";
import { assignCoupon, deleteCoupon, fetchCoupons, saveCoupon } from "./coupon-api";

export interface CouponsController {
  data: CouponListData;
  loading: boolean;
  error: string | null;
  notice: string | null;
  save: (id: string | null, input: CouponInput) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
  assign: (id: string, userId: string) => Promise<boolean>;
}

const EMPTY: CouponListData = { coupons: [], users: [] };

const message = (error: unknown): string => (error instanceof Error ? error.message : "Request failed");

export function useCoupons(): CouponsController {
  const [data, setData] = useState<CouponListData>(EMPTY);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    let active = true;
    fetchCoupons()
      .then((result: CouponListData): void => {
        if (active) setData(result);
      })
      .catch((reason: unknown): void => {
        if (active) setError(message(reason));
      })
      .finally((): void => {
        if (active) setLoading(false);
      });
    return (): void => {
      active = false;
    };
  }, [version]);

  const mutate = useCallback(async (action: () => Promise<void>, done: string | null): Promise<boolean> => {
    try {
      await action();
      setError(null);
      setNotice(done);
      setVersion((value: number): number => value + 1);
      return true;
    } catch (reason: unknown) {
      setNotice(null);
      setError(message(reason));
      return false;
    }
  }, []);

  const save = useCallback(
    (id: string | null, input: CouponInput): Promise<boolean> => mutate(() => saveCoupon(id, input), null),
    [mutate],
  );
  const remove = useCallback(
    async (id: string): Promise<void> => {
      await mutate(() => deleteCoupon(id), null);
    },
    [mutate],
  );
  const assign = useCallback(
    (id: string, userId: string): Promise<boolean> => mutate(() => assignCoupon(id, userId), "Coupon assigned"),
    [mutate],
  );

  return { data, loading, error, notice, save, remove, assign };
}
