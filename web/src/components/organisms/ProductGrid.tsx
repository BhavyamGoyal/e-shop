import { ProductCard } from "../molecules";
import type { Product } from "@/lib/website-data";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
        No products match these filters.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product: Product) => (
        <ProductCard key={product.href} product={product} />
      ))}
    </div>
  );
}
