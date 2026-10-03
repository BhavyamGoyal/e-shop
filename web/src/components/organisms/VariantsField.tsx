"use client";

import { useState } from "react";
import type { VariantInput } from "@/server/types/admin.types";
import { Button, Heading } from "../atoms";
import { CheckField, FormField, ListField } from "../molecules";
import { ImagePicker } from "./ImagePicker";

export interface VariantsFieldProps {
  variants: VariantInput[];
  basePrice: number;
  onChange: (variants: VariantInput[]) => void;
}

const blank = (price: number): VariantInput => ({
  id: null,
  title: "",
  sku: "",
  price,
  compareAtPrice: null,
  available: true,
  options: [],
  image: "",
});

export function VariantsField({ variants, basePrice, onChange }: VariantsFieldProps) {
  const [picking, setPicking] = useState<number | null>(null);

  const patch = (index: number, change: Partial<VariantInput>): void =>
    onChange(variants.map((variant: VariantInput, at: number): VariantInput => (at === index ? { ...variant, ...change } : variant)));

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Heading level={3}>Variants</Heading>
        <Button variant="outline" tone="secondary" onClick={() => onChange([...variants, blank(basePrice)])}>
          Add variant
        </Button>
      </div>
      {variants.map((variant, index) => (
        <div key={variant.id ?? `new-${index}`} className="flex flex-col gap-3 rounded-lg border bg-surface p-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FormField id={`v-title-${index}`} label="Title" value={variant.title} onChange={(e) => patch(index, { title: e.target.value })} />
            <FormField id={`v-sku-${index}`} label="SKU" value={variant.sku} onChange={(e) => patch(index, { sku: e.target.value })} />
            <FormField
              id={`v-price-${index}`}
              label="Price"
              type="number"
              min={0}
              value={variant.price}
              onChange={(e) => patch(index, { price: Number(e.target.value) })}
            />
            <FormField
              id={`v-compare-${index}`}
              label="Compare-at price"
              type="number"
              min={0}
              value={variant.compareAtPrice ?? ""}
              onChange={(e) => patch(index, { compareAtPrice: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>
          <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <ListField
              id={`v-options-${index}`}
              label="Option values"
              hint="Comma separated, in option order"
              values={variant.options}
              onCommit={(options: string[]) => patch(index, { options })}
            />
            <div className="flex items-center gap-2">
              {variant.image ? <img src={variant.image} alt="" className="h-10 w-10 rounded object-cover" /> : null}
              <Button variant="outline" tone="secondary" onClick={() => setPicking(index)}>
                {variant.image ? "Change image" : "Choose image"}
              </Button>
              {variant.image ? (
                <Button variant="ghost" onClick={() => patch(index, { image: "" })}>
                  Clear
                </Button>
              ) : null}
            </div>
            <CheckField label="Available" checked={variant.available} onChange={(e) => patch(index, { available: e.target.checked })} />
            <Button variant="outline" tone="danger" onClick={() => onChange(variants.filter((_: VariantInput, at: number): boolean => at !== index))}>
              Remove
            </Button>
          </div>
        </div>
      ))}
      {picking !== null ? (
        <ImagePicker
          multiple={false}
          onPick={(urls: string[]) => {
            patch(picking, { image: urls[0] ?? "" });
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      ) : null}
    </section>
  );
}
