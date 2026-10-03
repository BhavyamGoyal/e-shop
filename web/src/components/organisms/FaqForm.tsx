"use client";

import { useState, type FormEvent } from "react";
import type { BlogOption, FaqInput } from "@/server/types/content.types";
import { Button, Label } from "../atoms";
import { Select } from "../atoms/Controls/Select";
import { CheckField, FormField, TextAreaField } from "../molecules";

export interface FaqFormProps {
  formId: string;
  initial: FaqInput;
  blogs: BlogOption[];
  submitLabel: string;
  onSubmit: (input: FaqInput) => Promise<boolean>;
  onCancel?: () => void;
  resetOnSuccess?: boolean;
}

export function FaqForm({ formId, initial, blogs, submitLabel, onSubmit, onCancel, resetOnSuccess }: FaqFormProps) {
  const [input, setInput] = useState<FaqInput>(initial);
  const [busy, setBusy] = useState<boolean>(false);

  const change = (patch: Partial<FaqInput>): void => setInput((current: FaqInput): FaqInput => ({ ...current, ...patch }));

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
        id={`${formId}-question`}
        label="Question"
        required
        value={input.question}
        onChange={(e) => change({ question: e.target.value })}
      />
      <TextAreaField
        id={`${formId}-answer`}
        label="Answer"
        required
        value={input.answer}
        onChange={(e) => change({ answer: e.target.value })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${formId}-blog`}>Linked blog post</Label>
          <Select
            id={`${formId}-blog`}
            value={input.blogId ?? ""}
            placeholder="None (general FAQ)"
            options={blogs.map((blog: BlogOption) => ({ value: blog.id, label: blog.title }))}
            onChange={(e) => change({ blogId: e.target.value || null })}
          />
        </div>
        <FormField
          id={`${formId}-position`}
          label="Order"
          type="number"
          value={input.position}
          onChange={(e) => change({ position: Number(e.target.value) })}
        />
      </div>
      <div className="flex flex-wrap gap-6">
        <CheckField label="Published" checked={input.published} onChange={(e) => change({ published: e.target.checked })} />
        <CheckField label="Show on home page" checked={input.showOnHome} onChange={(e) => change({ showOnHome: e.target.checked })} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !input.question.trim() || !input.answer.trim()}>
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
