"use client";

import { useEffect } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { loadBalance } from "@/lib/account-loaders";
import { useAccountStore } from "@/stores/account/Account.store";

export function useTinglePoints(refreshKey: string = ""): number {
  const hydrated: boolean = useHydrated();
  const balance: number = useAccountStore((state) => state.balance);

  useEffect((): void => {
    void loadBalance();
  }, [refreshKey]);

  return hydrated ? balance : 0;
}
