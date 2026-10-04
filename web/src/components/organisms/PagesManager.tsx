"use client";

import Link from "next/link";
import { usePages } from "@/lib/use-pages";
import type { PageRecord } from "@/server/types/content.types";
import { Button, Heading, Text } from "../atoms";
import { AlertMessage } from "../molecules";

export function PagesManager() {
  const pages = usePages();

  const confirmDelete = (page: PageRecord): void => {
    if (window.confirm(`Delete the page /${page.url}?`)) void pages.remove(page.id);
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Heading level={2}>Pages</Heading>
          <Text tone="muted" className="text-sm">
            {pages.pages.length} pages, written in Markdown
          </Text>
        </div>
        <Link href="/admin/pages/new">
          <Button>New page</Button>
        </Link>
      </div>
      {pages.error ? <AlertMessage tone="danger" message={pages.error} /> : null}
      {pages.loading ? <Text tone="muted">Loading...</Text> : null}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">URL</th>
              <th className="px-4 py-2 font-medium">Updated</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {pages.pages.map((page: PageRecord) => (
              <tr key={page.id} className="border-t">
                <td className="px-4 py-2 font-medium">{page.title}</td>
                <td className="px-4 py-2 text-muted-foreground">/{page.url}</td>
                <td className="px-4 py-2">{new Date(page.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <Link href={`/${page.url}`} target="_blank">
                      <Button size="sm" variant="outline" tone="secondary">
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/pages/${page.id}`}>
                      <Button size="sm" variant="outline" tone="secondary">
                        Edit
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" tone="danger" onClick={() => confirmDelete(page)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
