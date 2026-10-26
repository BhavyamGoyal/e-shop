import { connectDb } from "../db/connect";
import { OrderModel, type OrderDocument } from "../models/order.model";
import type { AddressSnapshot } from "../types/address.types";
import type { OrderDelivery } from "../types/delivery.types";
import type { InvoiceEntry, OrderLineRecord } from "../types/order.types";

export type StoredOrder = OrderDocument & { _id: unknown };

export interface NewOrder {
  orderNumber: string;
  userId: string;
  email: string;
  isLoggedOutOrder: boolean;
  items: OrderLineRecord[];
  shippingAddress: AddressSnapshot;
  subtotal: number;
  discount: number;
  couponId: string | null;
  couponCode: string | null;
  deliveryCharge: number;
  invoiceData: InvoiceEntry[];
  delivery: OrderDelivery;
  total: number;
  tinglePointsUsed: number;
  tinglePointsEarned: number;
  currency: string;
}

export const orderRepository = {
  async create(order: NewOrder): Promise<string> {
    await connectDb();
    const { location, ...rest }: AddressSnapshot = order.shippingAddress;
    const shippingAddress = location
      ? { ...rest, location: { type: "Point", coordinates: [location.lng, location.lat] } }
      : rest;
    const created = await OrderModel.create({ ...order, shippingAddress });
    return String(created._id);
  },

  async list(filter: { userId?: string }, limit: number): Promise<StoredOrder[]> {
    await connectDb();
    return OrderModel.find(filter).sort({ createdAt: -1 }).limit(limit).lean<StoredOrder[]>();
  },

  async findByNumber(orderNumber: string, userId?: string): Promise<(StoredOrder & { _id: unknown }) | null> {
    await connectDb();
    return OrderModel.findOne({ orderNumber, ...(userId ? { userId } : {}) }).lean<StoredOrder & { _id: unknown }>();
  },

  async markPaid(orderId: string): Promise<StoredOrder | null> {
    await connectDb();
    return OrderModel.findOneAndUpdate(
      { _id: orderId, status: "pending" },
      { $set: { status: "paid", paidAt: new Date() } },
    ).lean<StoredOrder>();
  },

  async countPendingWithCoupon(userId: string, couponId: string, since: Date): Promise<number> {
    await connectDb();
    return OrderModel.countDocuments({ userId, couponId, status: "pending", createdAt: { $gte: since } });
  },
};
