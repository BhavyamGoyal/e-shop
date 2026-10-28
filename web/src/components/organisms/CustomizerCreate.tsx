"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEXT_KEYCHAIN_RENDERER } from "@/customizers/renderers/keys";
import { useCustomizers } from "@/lib/use-customizers";
import type { CustomizerInput } from "@/server/types/customizer.types";
import { Button, Heading, Text } from "../atoms";
import { CustomizerForm } from "./CustomizerForm";

const BLANK: CustomizerInput = { slug: "", title: "", renderer: TEXT_KEYCHAIN_RENDERER, params: [], active: true };

export function CustomizerCreate() {
  const customizers = useCustomizers();
  const router = useRouter();

  const create = async (input: CustomizerInput): Promise<boolean> => {
    const ok: boolean = await customizers.save(null, input);
    if (ok) router.push("/admin/customizers");
    return ok;
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={2}>Add customizer</Heading>
          <Text tone="muted" className="text-sm">
            Define the options shoppers can change, then attach it to a product from the product editor.
          </Text>
        </div>
        <Link href="/admin/customizers">
          <Button variant="outline" tone="secondary">
            Back to customizers
          </Button>
        </Link>
      </div>
      <CustomizerForm formId="new-customizer" initial={BLANK} submitLabel="Add customizer" onSubmit={create} error={customizers.error} />
    </section>
  );
}
