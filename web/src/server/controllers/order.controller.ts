import { requireCustomer, requireStaff } from "../auth/guard";
import { NotFoundError } from "../http/errors";
import { toOrderDetail, toOrderSummary } from "../mappers/order.mapper";
import { orderRepository, type StoredOrder } from "../repositories/order.repository";
import { paymentRepository, type StoredPayment } from "../repositories/payment.repository";
import type { OrderDetail, OrderSummary } from "../types/order-view.types";

const LIST_LIMIT = 200;

async function summaries(orders: StoredOrder[]): Promise<OrderSummary[]> {
  if (orders.length === 0) return [];
  const payments: StoredPayment[] = await paymentRepository.findByOrderNumbers(
    orders.map((order: StoredOrder): string => order.orderNumber),
  );
  const byNumber: Map<string, StoredPayment> = new Map(
    payments.map((payment: StoredPayment): [string, StoredPayment] => [payment.orderNumber, payment]),
  );
  return orders.map((order: StoredOrder): OrderSummary => toOrderSummary(order, byNumber.get(order.orderNumber) ?? null));
}

async function detailOf(orderNumber: string, userId?: string): Promise<OrderDetail> {
  const order = await orderRepository.findByNumber(orderNumber, userId);
  if (!order) throw new NotFoundError("Order not found");
  const [payment]: StoredPayment[] = await paymentRepository.findByOrderNumbers([orderNumber]);
  return toOrderDetail(order, payment ?? null);
}

export const orderController = {
  async listAll(): Promise<OrderSummary[]> {
    await requireStaff();
    return summaries(await orderRepository.list({}, LIST_LIMIT));
  },

  async detail(orderNumber: string): Promise<OrderDetail> {
    await requireStaff();
    return detailOf(orderNumber);
  },

  async listMine(): Promise<OrderDetail[]> {
    const userId: string = String((await requireCustomer())._id);
    const orders: StoredOrder[] = (await orderRepository.list({ userId }, LIST_LIMIT)).filter(
      (order: StoredOrder): boolean => order.status !== "pending",
    );
    return Promise.all(orders.map((order: StoredOrder): Promise<OrderDetail> => detailOf(order.orderNumber, userId)));
  },
};
