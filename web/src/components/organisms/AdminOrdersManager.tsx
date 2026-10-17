"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchOrders } from "@/lib/admin-api";
import { formatPaise } from "@/lib/format-price";
import type { OrderSummary } from "@/server/types/order-view.types";
import { Heading, Text } from "../atoms";
import { AlertMessage, StatusBadge } from "../molecules";

export function AdminOrdersManager() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch((reason: unknown): void => setError(reason instanceof Error ? reason.message : "Request failed"))
      .finally((): void => setLoading(false));
  }, []);

  return (
    <section className="flex flex-col gap-5">
      <div>
        <Heading level={2}>Orders</Heading>
        <Text tone="muted" className="text-sm">
          {orders.length} most recent orders
        </Text>
      </div>
      {error ? <AlertMessage tone="danger" message={error} /> : null}
      {loading ? <Text tone="muted">Loading...</Text> : null}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Order</th>
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 text-right font-medium">Items</th>
              <th className="px-4 py-2 text-right font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Order status</th>
              <th className="px-4 py-2 font-medium">Payment</th>
              <th className="px-4 py-2 font-medium">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: OrderSummary) => (
              <tr
                key={order.orderNumber}
                onClick={() => router.push(`/admin/orders/${order.orderNumber}`)}
                className="cursor-pointer border-t hover:bg-muted"
              >
                <td className="px-4 py-2 font-medium">{order.orderNumber}</td>
                <td className="px-4 py-2">
                  {order.email}
                  {order.isLoggedOutOrder ? <span className="ml-2 text-xs text-muted-foreground">Logged out</span> : null}
                </td>
                <td className="px-4 py-2 text-right">{order.itemCount}</td>
                <td className="px-4 py-2 text-right">{formatPaise(order.total)}</td>
                <td className="px-4 py-2"><StatusBadge status={order.status} /></td>
                <td className="px-4 py-2">
                  {order.payment ? <StatusBadge status={order.payment.status} /> : "-"}
                  {order.payment?.method ? <span className="ml-2 text-xs text-muted-foreground">{order.payment.method}</span> : null}
                </td>
                <td className="px-4 py-2">{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
