import { connectDb } from "../db/connect";
import { PaymentModel, type PaymentDocument } from "../models/payment.model";

export type StoredPayment = PaymentDocument & { _id: unknown };

export interface NewPayment {
  orderId: string;
  orderNumber: string;
  userId: string;
  providerOrderId: string;
  amount: number;
  currency: string;
}

export interface CapturedDetails {
  providerPaymentId: string;
  method: string | null;
}

export const paymentRepository = {
  async create(payment: NewPayment): Promise<void> {
    await connectDb();
    await PaymentModel.create(payment);
  },

  async findByProviderOrderId(providerOrderId: string): Promise<StoredPayment | null> {
    await connectDb();
    return PaymentModel.findOne({ providerOrderId }).lean<StoredPayment>();
  },

  async markFailed(providerOrderId: string, failureReason: string): Promise<void> {
    await connectDb();
    await PaymentModel.updateOne(
      { providerOrderId, status: "created" },
      { $set: { status: "failed", failureReason } },
    );
  },

  async markCaptured(providerOrderId: string, details: CapturedDetails): Promise<void> {
    await connectDb();
    await PaymentModel.updateOne(
      { providerOrderId, status: { $ne: "captured" } },
      { $set: { ...details, status: "captured", signatureVerified: true, capturedAt: new Date() } },
    );
  },
};
