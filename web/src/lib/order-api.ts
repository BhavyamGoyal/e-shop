import { request } from "@/lib/api-request";
import type { OrderDetail } from "@/server/types/order-view.types";

export const fetchOrders = async (): Promise<OrderDetail[]> =>
  (await request<{ data: OrderDetail[] }>("GET", "/api/orders")).data;
