"use client";

import type { ProductInput } from "@/server/types/admin.types";
import { useEffect, useState } from "react";
import { fetchTags } from "@/lib/admin-api";
import { Heading, Label } from "../atoms";
import { CheckField, FormField, ListField, TextAreaField } from "../molecules";
import { TagPicker } from "./TagPicker";

export interface ProductBasicsFieldsProps {
  input: ProductInput;
  onChange: (patch: Partial<ProductInput>) => void;
}

export function ProductBasicsFields({ input, onChange }: ProductBasicsFieldsProps) {
  const [tagOptions, setTagOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchTags()
      .then((tags): void => setTagOptions(tags.map((tag): string => tag.name)))
      .catch((): void => setTagOptions([]));
  }, []);

  return (
    <section className="flex flex-col gap-4">
      <Heading level={3}>Details</Heading>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="title" label="Title" value={input.title} onChange={(e) => onChange({ title: e.target.value })} required />
        <FormField
          id="handle"
          label="Handle (URL slug)"
          hint={`/product/${input.handle || "..."}`}
          value={input.handle}
          onChange={(e) => onChange({ handle: e.target.value })}
        />
        <FormField id="vendor" label="Vendor" value={input.vendor} onChange={(e) => onChange({ vendor: e.target.value })} />
        <FormField id="productType" label="Product type" value={input.productType} onChange={(e) => onChange({ productType: e.target.value })} />
        <FormField
          id="price"
          label="Price (INR)"
          type="number"
          min={0}
          value={input.price}
          hint="Overridden by the lowest variant price when variants exist"
          onChange={(e) => onChange({ price: Number(e.target.value) })}
        />
        <FormField
          id="compareAtPrice"
          label="Compare-at price"
          type="number"
          min={0}
          value={input.compareAtPrice ?? ""}
          onChange={(e) => onChange({ compareAtPrice: e.target.value === "" ? null : Number(e.target.value) })}
        />
        <div className="flex flex-col gap-1.5">
          <Label>Tags</Label>
          <TagPicker options={tagOptions} selected={input.tags} onChange={(tags: string[]) => onChange({ tags })} />
        </div>
        <ListField
          id="collections"
          label="Collections"
          hint="Comma separated collection handles"
          values={input.collections}
          onCommit={(collections: string[]) => onChange({ collections })}
        />
      </div>
      <CheckField label="Available for sale" checked={input.available} onChange={(e) => onChange({ available: e.target.checked })} />
      <TextAreaField
        id="descriptionHtml"
        label="Description (HTML)"
        className="min-h-48 font-mono"
        value={input.descriptionHtml}
        onChange={(e) => onChange({ descriptionHtml: e.target.value })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="seoTitle" label="SEO title" value={input.seoTitle} onChange={(e) => onChange({ seoTitle: e.target.value })} />
        <FormField id="seoDescription" label="SEO description" value={input.seoDescription} onChange={(e) => onChange({ seoDescription: e.target.value })} />
      </div>
    </section>
  );
}
