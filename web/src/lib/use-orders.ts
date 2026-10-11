import { useEffect, useState } from "react";
import { AuthRequiredError } from "@/lib/api-request";
import { fetchOrders } from "@/lib/order-api";
import type { OrderDetail } from "@/server/types/order-view.types";

export interface OrdersState {
  orders: OrderDetail[];
  loading: boolean;
  authRequired: boolean;
  error: string;
}

export function useOrders(): OrdersState {
  const [state, setState] = useState<OrdersState>({ orders: [], loading: true, authRequired: false, error: "" });

  useEffect((): void => {
    fetchOrders()
      .then((orders: OrderDetail[]): void => setState({ orders, loading: false, authRequired: false, error: "" }))
      .catch((failure: unknown): void =>
        setState({
          orders: [],
          loading: false,
          authRequired: failure instanceof AuthRequiredError,
          error: failure instanceof AuthRequiredError || !(failure instanceof Error) ? "" : failure.message,
        }),
      );
  }, []);

  return state;
}
