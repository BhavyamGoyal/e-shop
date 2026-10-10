import { connectDb } from "../db/connect";
import { OrderModel, type OrderDocument } from "../models/order.model";
import type { AddressSnapshot } from "../types/address.types";
import type { OrderLineRecord } from "../types/order.types";

export type StoredOrder = OrderDocument;

export interface NewOrder {
  orderNumber: string;
  userId: string;
  email: string;
  items: OrderLineRecord[];
  shippingAddress: AddressSnapshot;
  total: number;
  currency: string;
}

export const orderRepository = {
  async create(order: NewOrder): Promise<string> {
    await connectDb();
    const { location, ...rest }: AddressSnapshot = order.shippingAddress;
    const shippingAddress = location
      ? { ...rest, location: { type: "Point", coordinates: [location.lng, location.lat] } }
      : rest;
    const created = await OrderModel.create({ ...order, shippingAddress, subtotal: order.total });
    return String(created._id);
  },

  async markPaid(orderId: string): Promise<void> {
    await connectDb();
    await OrderModel.updateOne({ _id: orderId, status: "pending" }, { $set: { status: "paid", paidAt: new Date() } });
  },
};
