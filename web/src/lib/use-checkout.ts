import { useRouter } from "next/router";
import { useState } from "react";
import { AuthRequiredError } from "@/lib/api-request";
import { createCheckoutOrder, verifyCheckoutPayment } from "@/lib/checkout-api";
import { loadRazorpay, type RazorpayFailure, type RazorpaySuccess } from "@/lib/razorpay-checkout";
import type { CheckoutOrder } from "@/server/types/order.types";
import { useCartStore } from "@/stores/cart/Cart.store";

export interface CheckoutState {
  busy: boolean;
  error: string;
  orderNumber: string;
  pay: (addressId: string) => Promise<void>;
}

const STORE_NAME = "Tinglet";

export function useCheckout(): CheckoutState {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");

  const confirm = async (response: RazorpaySuccess): Promise<void> => {
    try {
      const result = await verifyCheckoutPayment(response);
      setOrderNumber(result.orderNumber);
      clear();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Payment verification failed");
    } finally {
      setBusy(false);
    }
  };

  const open = (order: CheckoutOrder): void => {
    if (!window.Razorpay) throw new Error("Payment window is unavailable");
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.razorpayOrderId,
      name: STORE_NAME,
      description: `Order ${order.orderNumber}`,
      prefill: { name: order.name, email: order.email },
      handler: (response: RazorpaySuccess): void => {
        void confirm(response);
      },
      modal: { ondismiss: (): void => setBusy(false) },
    });
    checkout.on("payment.failed", (response: RazorpayFailure): void => {
      setError(response.error.description || "Payment failed. Please try again.");
      setBusy(false);
    });
    checkout.open();
  };

  const pay = async (addressId: string): Promise<void> => {
    setBusy(true);
    setError("");
    try {
      if (!(await loadRazorpay())) throw new Error("Could not load the payment window");
      open(await createCheckoutOrder(items, addressId));
    } catch (failure) {
      setBusy(false);
      if (failure instanceof AuthRequiredError) {
        await router.push("/login?next=/cart");
        return;
      }
      setError(failure instanceof Error ? failure.message : "Something went wrong");
    }
  };

  return { busy, error, orderNumber, pay };
}
