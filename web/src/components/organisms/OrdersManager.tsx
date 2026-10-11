"use client";

import { Text } from "../atoms";
import { AlertMessage, LoginPrompt } from "../molecules";
import { OrderCard } from "./OrderCard";
import { useOrders, type OrdersState } from "@/lib/use-orders";
import type { OrderDetail } from "@/server/types/order-view.types";

export function OrdersManager() {
  const { orders, loading, authRequired, error }: OrdersState = useOrders();

  if (loading) return <div className="h-24 animate-pulse rounded-2xl bg-muted" aria-busy />;
  if (authRequired) return <LoginPrompt message="Log in to see your orders." next="/account/orders" />;

  return (
    <section className="flex flex-col gap-4">
      {error && <AlertMessage tone="danger" message={error} />}
      {orders.length === 0 && !error && <Text tone="muted">You have not placed any orders yet.</Text>}
      <ul className="flex flex-col gap-4">
        {orders.map((order: OrderDetail) => (
          <OrderCard key={order.orderNumber} order={order} />
        ))}
      </ul>
    </section>
  );
}
