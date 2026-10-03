"use client";

import { useState } from "react";
import { useFaqs } from "@/lib/use-faqs";
import type { FaqInput, FaqRecord } from "@/server/types/content.types";
import { Badge, Button, Heading, Text } from "../atoms";
import { AlertMessage } from "../molecules";
import { FaqForm } from "./FaqForm";

const BLANK: FaqInput = { question: "", answer: "", blogId: null, position: 0, published: true, showOnHome: false };

const toInput = (faq: FaqRecord): FaqInput => ({
  question: faq.question,
  answer: faq.answer,
  blogId: faq.blogId,
  position: faq.position,
  published: faq.published,
  showOnHome: faq.showOnHome,
});

export function FaqsManager() {
  const faqs = useFaqs();
  const [editingId, setEditingId] = useState<string | null>(null);

  const confirmDelete = (faq: FaqRecord): void => {
    if (window.confirm(`Delete this FAQ?\n\n${faq.question}`)) void faqs.remove(faq.id);
  };

  const saveEdit = async (id: string, input: FaqInput): Promise<boolean> => {
    const ok: boolean = await faqs.save(id, input);
    if (ok) setEditingId(null);
    return ok;
  };

  return (
    <section className="flex flex-col gap-5">
      <div>
        <Heading level={2}>FAQs</Heading>
        <Text tone="muted" className="text-sm">
          {faqs.data.faqs.length} FAQs. Link one to a blog post to show it under that post, or leave it general to show it
          on /faq.
        </Text>
      </div>
      {faqs.error ? <AlertMessage tone="danger" message={faqs.error} /> : null}
      <FaqForm
        formId="new-faq"
        initial={BLANK}
        blogs={faqs.data.blogs}
        submitLabel="Add FAQ"
        onSubmit={(input: FaqInput) => faqs.save(null, input)}
        resetOnSuccess
      />
      {faqs.loading ? <Text tone="muted">Loading...</Text> : null}
      <ul className="flex flex-col gap-3">
        {faqs.data.faqs.map((faq: FaqRecord) => (
          <li key={faq.id}>
            {editingId === faq.id ? (
              <FaqForm
                formId={`faq-${faq.id}`}
                initial={toInput(faq)}
                blogs={faqs.data.blogs}
                submitLabel="Save FAQ"
                onSubmit={(input: FaqInput) => saveEdit(faq.id, input)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border p-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{faq.question}</div>
                  <Text tone="muted" className="mt-1 line-clamp-2 text-sm">
                    {faq.answer}
                  </Text>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge>{faq.blogTitle ?? "General"}</Badge>
                    {faq.showOnHome ? <Badge>On home page</Badge> : null}
                    {faq.published ? null : <Badge>Hidden</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" tone="secondary" onClick={() => setEditingId(faq.id)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" tone="danger" onClick={() => confirmDelete(faq)}>
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
