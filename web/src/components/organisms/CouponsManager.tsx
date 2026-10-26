"use client";

import { useState } from "react";
import { formatPaise } from "@/lib/format-price";
import { useCoupons } from "@/lib/use-coupons";
import type { CouponInput, CouponRecord } from "@/server/types/coupon.types";
import { Badge, Button, Heading, Text } from "../atoms";
import { AlertMessage } from "../molecules";
import { CouponAssign } from "./CouponAssign";
import { CouponForm } from "./CouponForm";

const BLANK: CouponInput = { code: "", description: "", discountPercent: 0, maxDiscountAmount: 0, usageLimit: 1 };

const toInput = (coupon: CouponRecord): CouponInput => ({
  code: coupon.code,
  description: coupon.description,
  discountPercent: coupon.discountPercent,
  maxDiscountAmount: coupon.maxDiscountAmount,
  usageLimit: coupon.usageLimit,
});

export function CouponsManager() {
  const coupons = useCoupons();
  const [editingId, setEditingId] = useState<string | null>(null);

  const confirmDelete = (coupon: CouponRecord): void => {
    if (window.confirm(`Delete coupon ${coupon.code}? It will be removed from all users.`)) void coupons.remove(coupon.id);
  };

  const saveEdit = async (id: string, input: CouponInput): Promise<boolean> => {
    const ok: boolean = await coupons.save(id, input);
    if (ok) setEditingId(null);
    return ok;
  };

  return (
    <section className="flex flex-col gap-5">
      <div>
        <Heading level={2}>Coupons</Heading>
        <Text tone="muted" className="text-sm">
          {coupons.data.coupons.length} coupons. Create a coupon, then assign it to the users who should get it.
        </Text>
      </div>
      {coupons.error ? <AlertMessage tone="danger" message={coupons.error} /> : null}
      {coupons.notice ? <AlertMessage tone="success" message={coupons.notice} /> : null}
      <CouponForm
        formId="new-coupon"
        initial={BLANK}
        submitLabel="Add coupon"
        onSubmit={(input: CouponInput) => coupons.save(null, input)}
        resetOnSuccess
      />
      {coupons.loading ? <Text tone="muted">Loading...</Text> : null}
      <ul className="flex flex-col gap-3">
        {coupons.data.coupons.map((coupon: CouponRecord) => (
          <li key={coupon.id}>
            {editingId === coupon.id ? (
              <CouponForm
                formId={`coupon-${coupon.id}`}
                initial={toInput(coupon)}
                submitLabel="Save coupon"
                onSubmit={(input: CouponInput) => saveEdit(coupon.id, input)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex flex-col gap-3 rounded-md border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{coupon.code}</div>
                    <Text tone="muted" className="mt-1 text-sm">
                      {coupon.description}
                    </Text>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge>
                        {coupon.discountPercent}% off up to {formatPaise(coupon.maxDiscountAmount)}
                      </Badge>
                      <Badge>
                        {coupon.usageLimit} {coupon.usageLimit === 1 ? "use" : "uses"} per user
                      </Badge>
                      <Badge>Assigned to {coupon.assignedCount}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" tone="secondary" onClick={() => setEditingId(coupon.id)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" tone="danger" onClick={() => confirmDelete(coupon)}>
                      Delete
                    </Button>
                  </div>
                </div>
                <CouponAssign users={coupons.data.users} onAssign={(userId: string) => coupons.assign(coupon.id, userId)} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
