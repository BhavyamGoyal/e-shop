"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/atoms";
import { QuantityStepper } from "@/components/molecules";
import { buildCartKey, newCustomizationId, parseCartKey, type ParsedCartKey } from "@/lib/cart-key";
import { resolveCustomization } from "@/lib/customizer-api";
import type { CustomizeProduct } from "@/lib/customize-page";
import { formatPrice } from "@/lib/format-price";
import type { CustomizerRecord } from "@/server/types/customizer.types";
import { useCartStore } from "@/stores/cart/Cart.store";
import type { CartItem } from "@/stores/cart/Cart.types";
import { paramResolver, type CartCustomization, type ParamValue, type ParamValues } from "../core";
import { ParamForm } from "./ParamForm";
import { RendererHost } from "./RendererHost";

interface CustomizerStudioProps {
  customizer: CustomizerRecord;
  product: CustomizeProduct;
  editKey: string | null;
}

export function CustomizerStudio({ customizer, product, editKey }: CustomizerStudioProps) {
  const router = useRouter();
  const add = useCartStore((state) => state.add);
  const replace = useCartStore((state) => state.replace);
  const editing: CartItem | undefined = useCartStore((state) =>
    editKey ? state.items.find((line: CartItem): boolean => line.key === editKey) : undefined,
  );
  const [params, setParams] = useState<ParamValues>(() =>
    paramResolver.resolve(customizer.params, editing?.customization?.params ?? {}),
  );
  const [quantity, setQuantity] = useState<number>(editing?.quantity ?? 1);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const editable = useMemo(() => customizer.params.some((definition) => definition.mutable), [customizer.params]);

  const change = (key: string, value: ParamValue): void => setParams((current: ParamValues) => ({ ...current, [key]: value }));

  const submit = async (): Promise<void> => {
    setSaving(true);
    setError("");
    try {
      const customization: CartCustomization = await resolveCustomization(customizer.slug, params);
      const parsed: ParsedCartKey | null = editing && editKey ? parseCartKey(editKey) : null;
      const item: CartItem = {
        key: buildCartKey(product.handle, product.variantId, parsed?.customizationId ?? newCustomizationId()),
        handle: product.handle,
        title: product.title,
        variantTitle: product.variantTitle,
        image: product.image,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        quantity,
        customization,
      };
      if (editing && editKey) replace(editKey, item);
      else add(item);
      router.push("/cart");
    } catch (failure: unknown) {
      setError(failure instanceof Error ? failure.message : "Could not save your design");
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <div className="lg:order-2 lg:sticky lg:top-24">
        <RendererHost rendererKey={customizer.renderer} params={params} />
      </div>
      <div className="flex flex-col gap-6 lg:order-1">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{customizer.title}</p>
          <h1 className="text-3xl font-semibold">{product.title}</h1>
          {product.variantTitle && <p className="text-sm text-muted-foreground">{product.variantTitle}</p>}
          <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
        </div>
        {editable ? (
          <ParamForm definitions={customizer.params} values={params} onChange={change} />
        ) : (
          <p className="text-sm text-muted-foreground">This product has no options to change.</p>
        )}
        <div className="flex items-stretch gap-3">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <Button size="lg" className="flex-1" disabled={!product.inStock || saving} onClick={submit}>
            {!product.inStock ? "Sold out" : saving ? "Saving…" : editing ? "Update cart" : "Add to cart"}
          </Button>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
