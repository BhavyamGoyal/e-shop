import { useEffect, useState } from "react";
import { fetchDeliveryEstimate, fetchDeliveryPartners } from "@/lib/delivery-api";
import type { DeliveryEstimate, DeliveryPartnerOption } from "@/server/types/delivery.types";
import type { CartItem } from "@/stores/cart/Cart.types";

const PINCODE = /^[1-9]\d{5}$/;

export interface DeliveryEstimateState {
  estimate: DeliveryEstimate | null;
  loading: boolean;
  error: string;
}

export function useDeliveryPartners(): DeliveryPartnerOption[] {
  const [partners, setPartners] = useState<DeliveryPartnerOption[]>([]);

  useEffect((): void => {
    fetchDeliveryPartners()
      .then(setPartners)
      .catch((): void => setPartners([]));
  }, []);

  return partners;
}

export function useDeliveryEstimate(partnerId: string, pincode: string, items: CartItem[]): DeliveryEstimateState {
  const [result, setResult] = useState<{ key: string; estimate: DeliveryEstimate | null; error: string } | null>(null);
  const key: string = `${partnerId}:${pincode.trim()}:${items.map((item: CartItem): string => `${item.key}x${item.quantity}`).join(",")}`;
  const ready: boolean = partnerId !== "" && PINCODE.test(pincode.trim());

  useEffect((): (() => void) | void => {
    if (!ready) return;
    let cancelled = false;
    fetchDeliveryEstimate(partnerId, pincode.trim(), items)
      .then((estimate: DeliveryEstimate): void => {
        if (!cancelled) setResult({ key, estimate, error: "" });
      })
      .catch((failure: unknown): void => {
        if (!cancelled) {
          setResult({ key, estimate: null, error: failure instanceof Error ? failure.message : "Could not get delivery estimate" });
        }
      });
    return (): void => {
      cancelled = true;
    };
  }, [ready, key, partnerId, pincode, items]);

  const current = ready && result?.key === key ? result : null;
  return { estimate: current?.estimate ?? null, loading: ready && current === null, error: current?.error ?? "" };
}
