"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { savePage } from "@/lib/admin-api";
import type { PageEditorData, PageInput } from "@/server/types/content.types";
import { Button, Heading, Label, Textarea } from "../atoms";
import { AlertMessage, FormField } from "../molecules";
import { MarkdownContent } from "./MarkdownContent";

export function PageEditor({ id, input: initial }: PageEditorData) {
  const router = useRouter();
  const [input, setInput] = useState<PageInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const change = (patch: Partial<PageInput>): void => setInput((current: PageInput): PageInput => ({ ...current, ...patch }));

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    try {
      await savePage(id, input);
      router.push("/admin/pages");
      router.refresh();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Save failed");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading level={2}>{id ? "Edit page" : "New page"}</Heading>
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="text-sm font-medium text-muted-foreground hover:text-primary">
            Back to pages
          </Link>
          {id ? (
            <Link href={`/${initial.url}`} target="_blank" className="text-sm font-medium text-primary">
              View
            </Link>
          ) : null}
          <Button type="submit" disabled={saving || !input.url.trim() || !input.content.trim()}>
            {saving ? "Saving..." : "Save page"}
          </Button>
        </div>
      </div>
      {error ? <AlertMessage tone="danger" message={error} /> : null}
      <FormField
        id="page-url"
        label="URL"
        required
        placeholder="privacy-policy"
        hint="Served at /your-url. Letters, numbers and dashes only."
        value={input.url}
        onChange={(e) => change({ url: e.target.value })}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="page-content">Content (Markdown)</Label>
          <Textarea
            id="page-content"
            required
            className="min-h-[32rem] font-mono"
            value={input.content}
            onChange={(e) => change({ content: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Preview</Label>
          <div className="max-h-[32rem] min-h-[32rem] overflow-auto rounded-md border p-4">
            <MarkdownContent content={input.content} />
          </div>
        </div>
      </div>
    </form>
  );
}
