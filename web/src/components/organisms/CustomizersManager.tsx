"use client";

import Link from "next/link";
import { useState } from "react";
import { useCustomizers } from "@/lib/use-customizers";
import type { CustomizerInput, CustomizerRecord } from "@/server/types/customizer.types";
import { Badge, Button, Heading, Text } from "../atoms";
import { AlertMessage } from "../molecules";
import { CustomizerForm } from "./CustomizerForm";

const toInput = (item: CustomizerRecord): CustomizerInput => ({
  slug: item.slug,
  title: item.title,
  renderer: item.renderer,
  params: item.params,
  active: item.active,
});

export function CustomizersManager() {
  const customizers = useCustomizers();
  const [editingId, setEditingId] = useState<string | null>(null);

  const confirmDelete = (item: CustomizerRecord): void => {
    if (window.confirm(`Delete customizer "${item.title}"?`)) void customizers.remove(item.id);
  };

  const saveEdit = async (id: string, input: CustomizerInput): Promise<boolean> => {
    const ok: boolean = await customizers.save(id, input);
    if (ok) setEditingId(null);
    return ok;
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Customizers</Heading>
          <Text tone="muted" className="text-sm">
            A customizer defines the options shoppers can change. Attach one to a product from the product editor.
          </Text>
        </div>
        <Link href="/admin/customizers/add">
          <Button>Add customizer</Button>
        </Link>
      </div>
      {customizers.error && editingId === null ? <AlertMessage tone="danger" message={customizers.error} /> : null}
      {customizers.loading ? <Text tone="muted">Loading...</Text> : null}
      <ul className="flex flex-col gap-3">
        {customizers.data.map((item: CustomizerRecord) => (
          <li key={item.id}>
            {editingId === item.id ? (
              <CustomizerForm
                formId={`customizer-${item.id}`}
                initial={toInput(item)}
                submitLabel="Save customizer"
                onSubmit={(input: CustomizerInput) => saveEdit(item.id, input)}
                onCancel={() => setEditingId(null)}
                error={customizers.error}
              />
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border p-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{item.title}</div>
                  <Text tone="muted" className="text-sm">
                    /customize/{item.slug} · {item.params.length} params · v{item.version}
                  </Text>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge>{item.renderer}</Badge>
                    {item.active ? null : <Badge>Inactive</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" tone="secondary" onClick={() => setEditingId(item.id)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" tone="danger" onClick={() => confirmDelete(item)}>
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
