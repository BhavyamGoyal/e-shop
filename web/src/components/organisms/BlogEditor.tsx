"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { saveBlog } from "@/lib/admin-api";
import type { BlogEditorData, BlogInput } from "@/server/types/content.types";
import { Button, Heading } from "../atoms";
import { AlertMessage, CheckField, FormField, TextAreaField } from "../molecules";
import { ImagePicker } from "./ImagePicker";

interface Notice {
  tone: "danger" | "success";
  message: string;
}

export function BlogEditor({ id: initialId, input: initial }: BlogEditorData) {
  const [id, setId] = useState<string | null>(initialId);
  const [input, setInput] = useState<BlogInput>(initial);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [picking, setPicking] = useState<boolean>(false);

  const change = (patch: Partial<BlogInput>): void => setInput((current: BlogInput): BlogInput => ({ ...current, ...patch }));

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await saveBlog(id, input);
      if (!id) window.history.replaceState(null, "", `/admin/blogs/${saved.id}`);
      setId(saved.id);
      change({ slug: saved.slug });
      setNotice({ tone: "success", message: "Saved. The storefront has been revalidated." });
    } catch (reason: unknown) {
      setNotice({ tone: "danger", message: reason instanceof Error ? reason.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading level={2}>{id ? "Edit blog post" : "New blog post"}</Heading>
        <div className="flex items-center gap-3">
          <Link href="/admin/blogs" className="text-sm font-medium text-muted-foreground hover:text-primary">
            Back to blogs
          </Link>
          {id && input.published ? (
            <Link href={`/blog/${input.slug}`} target="_blank" className="text-sm font-medium text-primary">
              View
            </Link>
          ) : null}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save post"}
          </Button>
        </div>
      </div>
      {notice ? <AlertMessage tone={notice.tone} message={notice.message} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="title" label="Title" required value={input.title} onChange={(e) => change({ title: e.target.value })} />
        <FormField
          id="slug"
          label="Slug"
          hint="Leave empty to generate from the title"
          value={input.slug}
          onChange={(e) => change({ slug: e.target.value })}
        />
      </div>
      <TextAreaField id="excerpt" label="Excerpt" value={input.excerpt} onChange={(e) => change({ excerpt: e.target.value })} />
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <FormField
            id="coverImage"
            label="Cover image URL"
            value={input.coverImage}
            onChange={(e) => change({ coverImage: e.target.value })}
          />
        </div>
        <Button variant="outline" tone="secondary" onClick={() => setPicking(true)}>
          Choose from library
        </Button>
      </div>
      {picking ? (
        <ImagePicker
          multiple={false}
          onPick={(urls: string[]) => {
            change({ coverImage: urls[0] ?? "" });
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      ) : null}
      <TextAreaField
        id="bodyHtml"
        label="Body (HTML)"
        className="min-h-96 font-mono"
        value={input.bodyHtml}
        onChange={(e) => change({ bodyHtml: e.target.value })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="seoTitle" label="SEO title" value={input.seoTitle} onChange={(e) => change({ seoTitle: e.target.value })} />
        <FormField
          id="seoDescription"
          label="SEO description"
          value={input.seoDescription}
          onChange={(e) => change({ seoDescription: e.target.value })}
        />
      </div>
      <CheckField label="Published" checked={input.published} onChange={(e) => change({ published: e.target.checked })} />
    </form>
  );
}
