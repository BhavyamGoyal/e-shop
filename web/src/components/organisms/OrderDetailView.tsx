import Link from "next/link";
import { formatPaise } from "@/lib/format-price";
import type { InvoiceEntry, OrderLineRecord } from "@/server/types/order.types";
import type { OrderDetail } from "@/server/types/order-view.types";
import { Heading, Text } from "../atoms";
import { Card, StatusBadge } from "../molecules";
import { CustomizationButton } from "./CustomizationButton";

const mapLink = (order: OrderDetail): string | null => {
  const point = order.shippingAddress.location;
  return point ? `https://www.google.com/maps?q=${point.lat},${point.lng}` : null;
};

function adjustments(order: OrderDetail): InvoiceEntry[] {
  if (order.invoiceData.length > 0) return order.invoiceData.filter((entry: InvoiceEntry): boolean => entry.code !== "items");
  const legacy: InvoiceEntry[] = [];
  if (order.discount > 0) {
    legacy.push({ type: "discount", code: "coupon", label: `Coupon${order.couponCode ? ` (${order.couponCode})` : ""}`, amount: order.discount });
  }
  if (order.deliveryCharge > 0) legacy.push({ type: "charge", code: "delivery", label: "Delivery", amount: order.deliveryCharge });
  return legacy;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all text-right">{value}</dd>
    </div>
  );
}

export function OrderDetailView({ order }: { order: OrderDetail }) {
  const address = order.shippingAddress;
  const payment = order.payment;
  const link: string | null = mapLink(order);
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>{order.orderNumber}</Heading>
          <Text tone="muted" className="text-sm">
            {order.email}{order.isLoggedOutOrder ? " (logged out order)" : ""} · placed {new Date(order.createdAt).toLocaleString()}
          </Text>
        </div>
        <Link href="/admin/orders" className="text-sm font-medium text-muted-foreground hover:text-primary">
          Back to orders
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-2">
          <Heading level={3}>Payment</Heading>
          <dl className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <dt className="text-muted-foreground">Order status</dt>
              <dd><StatusBadge status={order.status} /></dd>
            </div>
            {payment ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-muted-foreground">Payment status</dt>
                  <dd><StatusBadge status={payment.status} /></dd>
                </div>
                <Row label="Method" value={payment.method ?? "-"} />
                <Row label="Razorpay order" value={payment.providerOrderId} />
                <Row label="Razorpay payment" value={payment.providerPaymentId ?? "-"} />
                <Row label="Signature verified" value={payment.signatureVerified ? "Yes" : "No"} />
                <Row label="Captured at" value={payment.capturedAt ? new Date(payment.capturedAt).toLocaleString() : "-"} />
                {payment.failureReason ? <Row label="Failure reason" value={payment.failureReason} /> : null}
              </>
            ) : (
              <Text tone="muted" className="text-sm">No payment record.</Text>
            )}
          </dl>
        </Card>
        <Card className="flex flex-col gap-1">
          <Heading level={3}>Delivery address</Heading>
          <Text className="text-sm font-medium">{address.fullName} · {address.phone}</Text>
          <Text tone="muted" className="text-sm">
            {[address.line1, address.line2, address.landmark].filter(Boolean).join(", ")}
          </Text>
          <Text tone="muted" className="text-sm">
            {address.city}, {address.state} {address.postalCode}
          </Text>
          {order.delivery ? (
            <Text className="text-sm font-medium">Estimated delivery {order.delivery.estimatedDate}</Text>
          ) : null}
          {link && address.location ? (
            <a href={link} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
              GPS {address.location.lat.toFixed(5)}, {address.location.lng.toFixed(5)} (open map)
            </a>
          ) : (
            <Text tone="muted" className="text-sm">No GPS location.</Text>
          )}
        </Card>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-4 py-2 text-right font-medium">Price</th>
              <th className="px-4 py-2 text-right font-medium">Qty</th>
              <th className="px-4 py-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((line: OrderLineRecord) => (
              <tr key={line.key} className="border-t">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    {line.image ? <img src={line.image} alt="" className="h-14 w-14 rounded-md object-cover" /> : <div className="h-14 w-14 rounded-md bg-muted" />}
                    <div className="min-w-0">
                      <Link href={`/product/${line.handle}`} target="_blank" className="font-medium hover:text-primary">
                        {line.title}
                      </Link>
                      {line.variantTitle ? <div className="text-xs text-muted-foreground">{line.variantTitle}</div> : null}
                      {line.customization ? (
                        <div className="mt-1">
                          <CustomizationButton customization={line.customization} fileName={`${order.orderNumber}-${line.handle}`} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 text-right">{formatPaise(line.unitAmount)}</td>
                <td className="px-4 py-2 text-right">{line.quantity}</td>
                <td className="px-4 py-2 text-right">{formatPaise(line.unitAmount * line.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {adjustments(order).map((entry: InvoiceEntry) => (
              <tr key={entry.code} className="border-t">
                <td className="px-4 py-2" colSpan={3}>{entry.label}</td>
                <td className="px-4 py-2 text-right">
                  {entry.type === "discount" ? "-" : ""}{formatPaise(entry.amount)}
                </td>
              </tr>
            ))}
            <tr className="border-t font-semibold">
              <td className="px-4 py-2" colSpan={3}>Total</td>
              <td className="px-4 py-2 text-right">{formatPaise(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
