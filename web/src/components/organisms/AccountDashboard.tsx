"use client";

import { useTinglePoints } from "@/lib/use-tingle-points";
import { useOrders, type OrdersState } from "@/lib/use-orders";
import { useProfile, type ProfileState } from "@/lib/use-profile";
import type { OrderDetail } from "@/server/types/order-view.types";
import { Text } from "../atoms";
import { AccountStats, AlertMessage, LoginPrompt, TinglePointsCard, TinglePointsGuide } from "../molecules";
import { RecentOrders } from "./RecentOrders";

const RECENT_COUNT = 3;

const isSettled = (order: OrderDetail): boolean => order.status !== "pending" && order.status !== "cancelled";

const sumOf = (orders: OrderDetail[], pick: (order: OrderDetail) => number): number =>
  orders.filter(isSettled).reduce((total: number, order: OrderDetail): number => total + pick(order), 0);

export function AccountDashboard() {
  const { profile, loaded }: ProfileState = useProfile();
  const { orders, loading, authRequired, error }: OrdersState = useOrders();
  const balance: number = useTinglePoints();
  const firstName: string = (profile?.name ?? "").split(" ")[0];

  if (loading || !loaded) return <div className="h-64 animate-pulse rounded-3xl bg-muted" aria-busy />;
  if (authRequired) return <LoginPrompt message="Log in to see your account." next="/account" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2 flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{firstName ? `Welcome back, ${firstName}` : "Your account"}</h1>
        <Text tone="muted" className="text-sm">Manage your orders, details and Tingle Points in one place.</Text>
      </div>
      {error && <AlertMessage tone="danger" message={error} />}
      <AccountStats
        stats={[
          { label: "Total orders", value: orders.length },
          { label: "Points earned", value: sumOf(orders, (order: OrderDetail): number => order.tinglePointsEarned) },
          { label: "Points used", value: sumOf(orders, (order: OrderDetail): number => order.tinglePointsUsed) },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <TinglePointsCard balance={balance} />
        <TinglePointsGuide />
      </div>
      <RecentOrders orders={orders.slice(0, RECENT_COUNT)} />
    </div>
  );
}
