"use client";

import Link from "next/link";
import { useState } from "react";
import { CartLine } from "../molecules";
import { EmptyState } from "../molecules/States/EmptyState";
import { AddressManager } from "./AddressManager";
import { CheckoutButton } from "./CheckoutButton";
import { CouponPicker } from "./CouponPicker";
import { DeliveryPartnerPicker } from "./DeliveryPartnerPicker";
import { GuestCheckoutForm } from "./GuestCheckoutForm";
import { TinglePointsRedeem } from "./TinglePointsRedeem";
import { useHydrated } from "@/hooks/useHydrated";
import { formatPaise, formatPrice } from "@/lib/format-price";
import { EMPTY_GUEST, isGuestReady } from "@/lib/guest-checkout";
import { useProfile } from "@/lib/use-profile";
import { useCheckout, type CheckoutState } from "@/lib/use-checkout";
import { useDeliveryEstimate, useDeliveryPartners, type DeliveryEstimateState } from "@/lib/use-delivery";
import { useMyCoupons } from "@/lib/use-my-coupons";
import { useTinglePoints } from "@/lib/use-tingle-points";
import { couponDiscountPaise } from "@/server/services/coupon-discount";
import { earnedPoints, maxRedeemablePoints, pointsValuePaise } from "@/server/services/tingle-points.service";
import { cartCount, useCartStore } from "@/stores/cart/Cart.store";
import type { DeliveryPartnerOption } from "@/server/types/delivery.types";
import type { UserCouponView } from "@/server/types/coupon.types";
import type { GuestCheckout } from "@/server/types/order.types";
import type { CartItem } from "@/stores/cart/Cart.types";

const subtotalOf = (items: CartItem[]): number =>
  items.reduce((total: number, item: CartItem): number => total + item.price * item.quantity, 0);

const subtotalPaiseOf = (items: CartItem[]): number =>
  items.reduce((total: number, item: CartItem): number => total + Math.round(item.price * 100) * item.quantity, 0);

const lineSavings = (item: CartItem): number =>
  item.compareAtPrice !== null && item.compareAtPrice > item.price
    ? (item.compareAtPrice - item.price) * item.quantity
    : 0;

const savingsOf = (items: CartItem[]): number =>
  items.reduce((total: number, item: CartItem): number => total + lineSavings(item), 0);

export function CartView() {
  const hydrated: boolean = useHydrated();
  const items: CartItem[] = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const checkout: CheckoutState = useCheckout();
  const [addressId, setAddressId] = useState<string>("");
  const [useTingle, setUseTingle] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>("");
  const balance: number = useTinglePoints(checkout.orderNumber);
  const coupons: UserCouponView[] = useMyCoupons(checkout.orderNumber);
  const { profile, loaded } = useProfile();
  const [guest, setGuest] = useState<GuestCheckout>(EMPTY_GUEST);
  const guestMode: boolean = loaded && !profile;
  const [addressPincode, setAddressPincode] = useState<string>("");
  const [partnerId, setPartnerId] = useState<string>("");
  const partners: DeliveryPartnerOption[] = useDeliveryPartners();
  const activePartnerId: string = partnerId || partners[0]?.id || "";
  const pincode: string = guestMode ? guest.address.postalCode : addressPincode;
  const delivery: DeliveryEstimateState = useDeliveryEstimate(activePartnerId, pincode, items);

  if (!hydrated) return <div className="h-64" aria-busy />;

  if (checkout.orderNumber) {
    return (
      <div className="flex flex-col items-center gap-4">
        <EmptyState title="Payment successful" message={`Thank you! Your order number is ${checkout.orderNumber}.`} />
        <Link
          href="/"
          className="rounded-[14px] bg-linear-to-b from-primary to-(--pp-green-d) px-8 py-3 font-semibold text-primary-foreground shadow-md hover:brightness-110"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <EmptyState title="Your cart is empty" message="Add something you love and it will show up here." />
        <Link
          href="/"
          className="rounded-[14px] bg-linear-to-b from-primary to-(--pp-green-d) px-8 py-3 font-semibold text-primary-foreground shadow-md hover:brightness-110"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const savings: number = savingsOf(items);
  const subtotalPaise: number = subtotalPaiseOf(items);
  const maxPoints: number = maxRedeemablePoints(subtotalPaise, balance);
  const pointsUsed: number = useTingle ? maxPoints : 0;
  const coupon: UserCouponView | undefined = coupons.find((item: UserCouponView): boolean => item.code === couponCode);
  const afterPointsPaise: number = subtotalPaise - pointsValuePaise(pointsUsed);
  const couponPaise: number = coupon ? couponDiscountPaise(coupon, afterPointsPaise) : 0;
  const deliveryPaise: number = delivery.estimate?.serviceable ? delivery.estimate.charge : 0;
  const payablePaise: number = afterPointsPaise - couponPaise + deliveryPaise;
  const discounted: boolean = pointsUsed > 0 || couponPaise > 0 || deliveryPaise > 0;
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="flex flex-col gap-8">
        <ul className="flex flex-col gap-4">
          {items.map((item: CartItem) => (
            <CartLine
              key={item.key}
              item={item}
              onQuantity={(quantity: number): void => setQuantity(item.key, quantity)}
              onRemove={(): void => remove(item.key)}
            />
          ))}
        </ul>
        {!loaded && <div className="h-24 animate-pulse rounded-2xl bg-muted" aria-busy />}
        {loaded && guestMode && <GuestCheckoutForm value={guest} onChange={setGuest} loginNext="/cart" />}
        {loaded && !guestMode && <AddressManager selectedId={addressId} onSelect={setAddressId} onPostalCode={setAddressPincode} loginNext="/cart" />}
      </div>
      <aside className="flex flex-col gap-4 rounded-2xl border border-(--pp-line) bg-(--pp-card) p-5 lg:sticky lg:top-[100px]">
        <h2 className="text-xl font-semibold">Order summary</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-(--pp-muted)">Items</dt>
            <dd>{cartCount(items)}</dd>
          </div>
          {savings > 0 && (
            <div className="flex justify-between">
              <dt className="text-(--pp-muted)">You save</dt>
              <dd className="font-medium text-(--pp-green)">{formatPrice(savings)}</dd>
            </div>
          )}
          {discounted && (
            <div className="flex justify-between">
              <dt className="text-(--pp-muted)">Subtotal</dt>
              <dd>{formatPrice(subtotalOf(items))}</dd>
            </div>
          )}
          {pointsUsed > 0 && (
            <div className="flex justify-between">
              <dt className="text-(--pp-muted)">Tingle Points ({pointsUsed})</dt>
              <dd className="font-medium text-(--pp-green)">-{formatPaise(pointsValuePaise(pointsUsed))}</dd>
            </div>
          )}
          {coupon && couponPaise > 0 && (
            <div className="flex justify-between">
              <dt className="text-(--pp-muted)">Coupon ({coupon.code})</dt>
              <dd className="font-medium text-(--pp-green)">-{formatPaise(couponPaise)}</dd>
            </div>
          )}
          {deliveryPaise > 0 && (
            <div className="flex justify-between">
              <dt className="text-(--pp-muted)">Delivery</dt>
              <dd>{formatPaise(deliveryPaise)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-(--pp-line) pt-3 text-base font-bold">
            <dt>{discounted ? "Total" : "Subtotal"}</dt>
            <dd>{formatPaise(payablePaise)}</dd>
          </div>
        </dl>
        {partners.length > 0 && (
          <DeliveryPartnerPicker
            partners={partners}
            selected={activePartnerId}
            onSelect={setPartnerId}
            state={delivery}
            hasPincode={/^[1-9]\d{5}$/.test(pincode.trim())}
          />
        )}
        {coupons.length > 0 && <CouponPicker coupons={coupons} selected={couponCode} onSelect={setCouponCode} />}
        {balance > 0 && (
          <TinglePointsRedeem balance={balance} maxPoints={maxPoints} applied={useTingle} onToggle={setUseTingle} />
        )}
        {earnedPoints(payablePaise - deliveryPaise) > 0 && (
          <p className="text-xs text-(--pp-muted)">You will earn {earnedPoints(payablePaise - deliveryPaise)} Tingle Points on this order.</p>
        )}
        <p className="text-xs text-(--pp-muted)">Inclusive of all taxes.</p>
        <CheckoutButton
          busy={checkout.busy}
          disabled={!loaded || delivery.estimate?.serviceable === false || (guestMode ? !isGuestReady(guest) : !addressId)}
          error={checkout.error}
          onPay={(): void => void checkout.pay(addressId, pointsUsed, coupon?.code ?? "", activePartnerId, guestMode ? guest : null)}
        />
      </aside>
    </div>
  );
}
