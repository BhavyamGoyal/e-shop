import { Badge, Text } from "../atoms";
import { OrderTracker } from "../molecules";
import { formatPaise } from "@/lib/format-price";
import { formatDate, isInProgress, STATUS_LABEL, STATUS_TONE } from "@/lib/order-status";
import type { OrderLineRecord } from "@/server/types/order.types";
import type { OrderDetail } from "@/server/types/order-view.types";

interface OrderCardProps {
  order: OrderDetail;
}

export function OrderCard({ order }: OrderCardProps) {
  const address = order.shippingAddress;
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-(--pp-line) bg-(--pp-card) p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">Order #{order.orderNumber}</span>
          <Text tone="muted" className="text-sm">
            Placed {formatDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"} · {formatPaise(order.total)}
          </Text>
        </div>
        <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
      </div>
      {isInProgress(order.status) && <OrderTracker status={order.status} />}
      <ul className="flex flex-col gap-3 border-t border-(--pp-line) pt-4">
        {order.items.map((line: OrderLineRecord) => (
          <li key={line.key} className="flex items-center gap-3">
            {line.image ? (
              <img src={line.image} alt={line.title} className="size-16 shrink-0 rounded-lg object-cover" />
            ) : (
              <span className="size-16 shrink-0 rounded-lg bg-muted" />
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <a href={`/product/${line.handle}`} className="truncate font-medium hover:underline">{line.title}</a>
              <Text tone="muted" className="text-sm">
                {[line.variantTitle, `Qty ${line.quantity}`].filter(Boolean).join(" · ")}
              </Text>
            </div>
            <span className="text-sm font-medium">{formatPaise(line.unitAmount * line.quantity)}</span>
          </li>
        ))}
      </ul>
      <Text tone="muted" className="border-t border-(--pp-line) pt-4 text-sm">
        Ship to {address.fullName}, {[address.line1, address.line2].filter(Boolean).join(", ")}, {address.city}, {address.state} {address.postalCode}
      </Text>
    </li>
  );
}
