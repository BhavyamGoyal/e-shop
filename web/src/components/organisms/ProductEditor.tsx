"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { deleteProductAction, saveProductAction } from "@/server/actions/product.actions";
import type { ActionResult, ProductEditorData, ProductInput } from "@/server/types/admin.types";
import { Button, Heading } from "../atoms";
import { AlertMessage } from "../molecules";
import { ImagesField } from "./ImagesField";
import { OptionsField } from "./OptionsField";
import { ProductBasicsFields } from "./ProductBasicsFields";
import { ProductPreview } from "./ProductPreview";
import { VariantsField } from "./VariantsField";

interface Notice {
  tone: "danger" | "success";
  message: string;
}

export function ProductEditor({ id: initialId, input: initial }: ProductEditorData) {
  const [id, setId] = useState<string | null>(initialId);
  const [input, setInput] = useState<ProductInput>(initial);
  const [savedHandle, setSavedHandle] = useState<string | null>(initialId ? initial.handle : null);
  const [version, setVersion] = useState<number>(0);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const change = (patch: Partial<ProductInput>): void => setInput((current: ProductInput): ProductInput => ({ ...current, ...patch }));

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    start(async (): Promise<void> => {
      const result: ActionResult = await saveProductAction(id, input);
      if (!result.ok || !result.id || !result.handle) {
        setNotice({ tone: "danger", message: result.error ?? "Save failed" });
        return;
      }
      if (!id) window.history.replaceState(null, "", `/admin/products/${result.id}`);
      setId(result.id);
      setSavedHandle(result.handle);
      change({ handle: result.handle });
      setVersion((value: number): number => value + 1);
      setNotice({ tone: "success", message: "Saved. The storefront page has been revalidated." });
    });
  };

  const remove = (): void => {
    if (!id || !window.confirm(`Delete "${input.title}"? This cannot be undone.`)) return;
    start(async (): Promise<void> => {
      const result: ActionResult = await deleteProductAction(id);
      if (!result.ok) {
        setNotice({ tone: "danger", message: result.error ?? "Delete failed" });
        return;
      }
      router.push("/admin/products");
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading level={2}>{id ? "Edit product" : "New product"}</Heading>
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-sm font-medium text-muted-foreground hover:text-primary">
            Back to products
          </Link>
          {id ? (
            <Button type="button" variant="outline" tone="danger" disabled={pending} onClick={remove}>
              Delete
            </Button>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save product"}
          </Button>
        </div>
      </div>
      {notice ? <AlertMessage tone={notice.tone} message={notice.message} /> : null}
      <ProductBasicsFields input={input} onChange={change} />
      <ImagesField images={input.images} onChange={(images) => change({ images })} />
      <OptionsField options={input.options} onChange={(options) => change({ options })} />
      <VariantsField variants={input.variants} basePrice={input.price} onChange={(variants) => change({ variants })} />
      {savedHandle ? <ProductPreview handle={savedHandle} version={version} /> : null}
    </form>
  );
}
