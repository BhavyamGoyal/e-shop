"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchCarts } from "@/lib/admin-api";
import { formatPrice } from "@/lib/format-price";
import type { CartSummary } from "@/server/types/cart.types";
import { Heading, Text } from "../atoms";
import { AlertMessage } from "../molecules";

export function CartsManager() {
  const router = useRouter();
  const [carts, setCarts] = useState<CartSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCarts()
      .then(setCarts)
      .catch((reason: unknown): void => setError(reason instanceof Error ? reason.message : "Request failed"))
      .finally((): void => setLoading(false));
  }, []);

  return (
    <section className="flex flex-col gap-5">
      <div>
        <Heading level={2}>Carts</Heading>
        <Text tone="muted" className="text-sm">
          {carts.length} active carts
        </Text>
      </div>
      {error ? <AlertMessage tone="danger" message={error} /> : null}
      {loading ? <Text tone="muted">Loading...</Text> : null}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 text-right font-medium">Products</th>
              <th className="px-4 py-2 text-right font-medium">Cart value</th>
              <th className="px-4 py-2 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {carts.map((cart: CartSummary) => (
              <tr
                key={cart.userId}
                onClick={() => router.push(`/admin/carts/${cart.userId}`)}
                className="cursor-pointer border-t hover:bg-muted"
              >
                <td className="px-4 py-2">{cart.email}</td>
                <td className="px-4 py-2 text-right">{cart.itemCount}</td>
                <td className="px-4 py-2 text-right">{formatPrice(cart.total)}</td>
                <td className="px-4 py-2">{new Date(cart.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
