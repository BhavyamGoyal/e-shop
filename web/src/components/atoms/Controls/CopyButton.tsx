"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@/components/atoms/Icons";
import type { CopyButtonProps } from "@/components/atoms/Controls/CopyButton.types";

export function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(): void {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy"
      className="ml-1 inline-grid size-4 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground"
    >
      {copied ? <CheckIcon className="size-3 text-primary" /> : <CopyIcon className="size-3" />}
    </button>
  );
}
