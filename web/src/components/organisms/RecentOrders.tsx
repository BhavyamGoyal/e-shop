import { Badge, Text } from "../atoms";
import { formatPaise } from "@/lib/format-price";
import { formatDate, STATUS_LABEL, STATUS_TONE } from "@/lib/order-status";
import type { OrderLineRecord } from "@/server/types/order.types";
import type { OrderDetail } from "@/server/types/order-view.types";

interface RecentOrdersProps {
  orders: OrderDetail[];
}

const VISIBLE_THUMBS = 3;

function OrderThumbs({ items }: { items: OrderLineRecord[] }) {
  const extra: number = items.length - VISIBLE_THUMBS;
  return (
    <div className="flex items-center -space-x-3">
      {items.slice(0, VISIBLE_THUMBS).map((line: OrderLineRecord) =>
        line.image ? (
          <img key={line.key} src={line.image} alt={line.title} className="size-12 rounded-lg border-2 border-background object-cover" />
        ) : (
          <span key={line.key} className="size-12 rounded-lg border-2 border-background bg-muted" />
        ),
      )}
      {extra > 0 && (
        <span className="flex size-12 items-center justify-center rounded-lg border-2 border-background bg-muted text-xs font-semibold">
          +{extra}
        </span>
      )}
    </div>
  );
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <section className="rounded-3xl border border-(--pp-line) bg-(--pp-card) p-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">Recent orders</h2>
        <a href="/account/orders" className="text-sm font-semibold text-primary hover:underline">View all</a>
      </div>
      {orders.length === 0 ? (
        <Text tone="muted" className="py-4">You have not placed any orders yet.</Text>
      ) : (
        <ul>
          {orders.map((order: OrderDetail) => (
            <li key={order.orderNumber} className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-(--pp-line) py-4 first:border-t-0">
              <OrderThumbs items={order.items} />
              <div className="flex min-w-32 flex-1 flex-col">
                <a href="/account/orders" className="font-semibold hover:underline">#{order.orderNumber}</a>
                <Text tone="muted" className="text-sm">
                  {formatDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                </Text>
              </div>
              <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
              <div className="flex min-w-20 flex-col items-end text-sm">
                <b>{formatPaise(order.total)}</b>
                {order.tinglePointsEarned > 0 && <span className="font-semibold text-success">+{order.tinglePointsEarned} pts</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
