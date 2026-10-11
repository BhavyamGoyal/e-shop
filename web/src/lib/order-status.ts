import type { Tone } from "@/components/atoms";
import type { OrderStatus } from "@/server/types/order.types";

export const TRACK_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "paid", label: "Order placed" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  paid: "Order placed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_TONE: Record<OrderStatus, Tone> = {
  pending: "warning",
  paid: "primary",
  shipped: "accent",
  delivered: "success",
  cancelled: "danger",
};

export const isInProgress = (status: OrderStatus): boolean => status === "paid" || status === "shipped";

export const stepIndex = (status: OrderStatus): number =>
  TRACK_STEPS.findIndex((step: { status: OrderStatus }): boolean => step.status === status);

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
