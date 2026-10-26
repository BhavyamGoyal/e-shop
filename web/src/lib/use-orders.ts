import { useEffect, useState } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { hasData } from "@/lib/account-cache";
import { loadOrders } from "@/lib/account-loaders";
import { AuthRequiredError } from "@/lib/api-request";
import { useAccountStore } from "@/stores/account/Account.store";
import type { OrderDetail } from "@/server/types/order-view.types";

export interface OrdersState {
  orders: OrderDetail[];
  loading: boolean;
  authRequired: boolean;
  error: string;
}

interface OrdersOutcome {
  settled: boolean;
  authRequired: boolean;
  error: string;
}

export function useOrders(): OrdersState {
  const hydrated: boolean = useHydrated();
  const orders: OrderDetail[] = useAccountStore((state) => state.orders);
  const ordersAt: number = useAccountStore((state) => state.ordersAt);
  const [outcome, setOutcome] = useState<OrdersOutcome>({ settled: false, authRequired: false, error: "" });

  useEffect((): void => {
    loadOrders()
      .then((): void => setOutcome({ settled: true, authRequired: false, error: "" }))
      .catch((failure: unknown): void =>
        setOutcome({
          settled: true,
          authRequired: failure instanceof AuthRequiredError,
          error: failure instanceof AuthRequiredError || !(failure instanceof Error) ? "" : failure.message,
        }),
      );
  }, []);

  const cached: boolean = hydrated && hasData(ordersAt);
  return {
    orders: hydrated ? orders : [],
    loading: !cached && !outcome.settled,
    authRequired: outcome.authRequired,
    error: outcome.error,
  };
}
