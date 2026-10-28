"use client";

import { useState } from "react";
import { RendererHost } from "@/customizers/components/RendererHost";
import type { CartCustomization } from "@/customizers/core";
import { Button, Heading } from "../atoms";

export interface CustomizationButtonProps {
  customization: CartCustomization;
  fileName: string;
}

export function CustomizationButton({ customization, fileName }: CustomizationButtonProps) {
  const [open, setOpen] = useState<boolean>(false);
  const safeName: string = fileName.replace(/[^\w-]+/g, "_");
  return (
    <>
      <Button size="sm" variant="outline" tone="secondary" onClick={() => setOpen(true)}>
        See customization
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" role="dialog" aria-modal="true">
          <div className="flex max-h-full w-full max-w-5xl flex-col gap-4 overflow-y-auto rounded-xl bg-surface p-5 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <Heading level={3}>Customization · {customization.slug}</Heading>
              <Button size="sm" variant="outline" tone="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <RendererHost
                rendererKey={customization.renderer}
                params={customization.params}
                downloadName={safeName}
                heightClass="h-[360px] md:h-[460px]"
              />
              <dl className="grid max-h-[460px] grid-cols-[auto_1fr] gap-x-4 gap-y-1 overflow-y-auto text-sm">
                {Object.entries(customization.params).map(([key, value]) => (
                  <div key={key} className="contents">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-medium break-words whitespace-pre-wrap">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
