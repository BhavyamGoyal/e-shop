"use client";

import { useState, type FormEvent } from "react";
import type { PageInput } from "@/server/types/content.types";
import { Button, Label, Textarea } from "../atoms";
import { FormField } from "../molecules";
import { MarkdownContent } from "./MarkdownContent";

export interface PageFormProps {
  formId: string;
  initial: PageInput;
  submitLabel: string;
  onSubmit: (input: PageInput) => Promise<boolean>;
  onCancel?: () => void;
  resetOnSuccess?: boolean;
}

export function PageForm({ formId, initial, submitLabel, onSubmit, onCancel, resetOnSuccess }: PageFormProps) {
  const [input, setInput] = useState<PageInput>(initial);
  const [busy, setBusy] = useState<boolean>(false);

  const change = (patch: Partial<PageInput>): void => setInput((current: PageInput): PageInput => ({ ...current, ...patch }));

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    const ok: boolean = await onSubmit(input);
    setBusy(false);
    if (ok && resetOnSuccess) setInput(initial);
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4 rounded-md border p-4">
      <FormField
        id={`${formId}-url`}
        label="URL"
        required
        placeholder="privacy-policy"
        hint="Served at /your-url. Letters, numbers and dashes only."
        value={input.url}
        onChange={(e) => change({ url: e.target.value })}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${formId}-content`}>Content (Markdown)</Label>
          <Textarea
            id={`${formId}-content`}
            required
            rows={18}
            className="font-mono"
            value={input.content}
            onChange={(e) => change({ content: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Preview</Label>
          <div className="max-h-[28rem] overflow-auto rounded-md border p-4">
            <MarkdownContent content={input.content} />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !input.url.trim() || !input.content.trim()}>
          {busy ? "Saving..." : submitLabel}
        </Button>
        {onCancel ? (
          <Button variant="outline" tone="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
