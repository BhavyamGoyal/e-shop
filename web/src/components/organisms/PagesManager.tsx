"use client";

import { useState } from "react";
import { usePages } from "@/lib/use-pages";
import type { PageInput, PageRecord } from "@/server/types/content.types";
import { Badge, Button, Heading, Text } from "../atoms";
import { AlertMessage } from "../molecules";
import { PageForm } from "./PageForm";

const BLANK: PageInput = { url: "", content: "" };

export function PagesManager() {
  const pages = usePages();
  const [editingId, setEditingId] = useState<string | null>(null);

  const confirmDelete = (page: PageRecord): void => {
    if (window.confirm(`Delete the page /${page.url}?`)) void pages.remove(page.id);
  };

  const saveEdit = async (id: string, input: PageInput): Promise<boolean> => {
    const ok: boolean = await pages.save(id, input);
    if (ok) setEditingId(null);
    return ok;
  };

  return (
    <section className="flex flex-col gap-5">
      <div>
        <Heading level={2}>Pages</Heading>
        <Text tone="muted" className="text-sm">
          {pages.pages.length} pages. Each page is written in Markdown and served at its URL. The first # heading becomes the
          page title.
        </Text>
      </div>
      {pages.error ? <AlertMessage tone="danger" message={pages.error} /> : null}
      <PageForm formId="new-page" initial={BLANK} submitLabel="Add page" onSubmit={(input: PageInput) => pages.save(null, input)} resetOnSuccess />
      {pages.loading ? <Text tone="muted">Loading...</Text> : null}
      <ul className="flex flex-col gap-3">
        {pages.pages.map((page: PageRecord) => (
          <li key={page.id}>
            {editingId === page.id ? (
              <PageForm
                formId={`page-${page.id}`}
                initial={{ url: page.url, content: page.content }}
                submitLabel="Save page"
                onSubmit={(input: PageInput) => saveEdit(page.id, input)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border p-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{page.title}</div>
                  <Badge className="mt-2">/{page.url}</Badge>
                </div>
                <div className="flex gap-2">
                  <a href={`/${page.url}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" tone="secondary">
                      View
                    </Button>
                  </a>
                  <Button size="sm" variant="outline" tone="secondary" onClick={() => setEditingId(page.id)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" tone="danger" onClick={() => confirmDelete(page)}>
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
