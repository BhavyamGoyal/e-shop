import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import type { CartDetail, CartLineRecord } from "@/server/types/cart.types";
import { Heading, Text } from "../atoms";

export function CartDetailView({ cart }: { cart: CartDetail }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>{cart.email}</Heading>
          <Text tone="muted" className="text-sm">
            {cart.name ? `${cart.name} · ` : ""}
            {cart.itemCount} products · {formatPrice(cart.total)} · updated {new Date(cart.updatedAt).toLocaleString()}
          </Text>
        </div>
        <Link href="/admin/carts" className="text-sm font-medium text-muted-foreground hover:text-primary">
          Back to carts
        </Link>
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
            {cart.items.map((line: CartLineRecord) => (
              <tr key={line.key} className="border-t">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    {line.image ? (
                      <img src={line.image} alt="" className="h-14 w-14 rounded-md object-cover" />
                    ) : (
                      <div className="h-14 w-14 rounded-md bg-muted" />
                    )}
                    <div className="min-w-0">
                      <Link href={`/product/${line.handle}`} target="_blank" className="font-medium hover:text-primary">
                        {line.title}
                      </Link>
                      {line.variantTitle ? <div className="text-xs text-muted-foreground">{line.variantTitle}</div> : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 text-right">{formatPrice(line.price)}</td>
                <td className="px-4 py-2 text-right">{line.quantity}</td>
                <td className="px-4 py-2 text-right">{formatPrice(line.price * line.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-semibold">
              <td className="px-4 py-2" colSpan={3}>
                Total
              </td>
              <td className="px-4 py-2 text-right">{formatPrice(cart.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
