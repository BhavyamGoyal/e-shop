"use client";

import Link from "next/link";
import { useBlogs } from "@/lib/use-blogs";
import type { BlogRow } from "@/server/types/content.types";
import { Badge, Button, Heading, Text } from "../atoms";
import { AlertMessage } from "../molecules";

export function BlogsManager() {
  const blogs = useBlogs();

  const confirmDelete = (blog: BlogRow): void => {
    if (window.confirm(`Delete "${blog.title}"? Its ${blog.faqCount} FAQ(s) will become general FAQs.`)) {
      void blogs.remove(blog.id);
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Heading level={2}>Blog posts</Heading>
          <Text tone="muted" className="text-sm">
            {blogs.blogs.length} posts
          </Text>
        </div>
        <Link href="/admin/blogs/new">
          <Button>New post</Button>
        </Link>
      </div>
      {blogs.error ? <AlertMessage tone="danger" message={blogs.error} /> : null}
      {blogs.loading ? <Text tone="muted">Loading...</Text> : null}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">FAQs</th>
              <th className="px-4 py-2 font-medium">Updated</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {blogs.blogs.map((blog: BlogRow) => (
              <tr key={blog.id} className="border-t">
                <td className="px-4 py-2">
                  <div className="font-medium">{blog.title}</div>
                  <div className="text-xs text-muted-foreground">/blog/{blog.slug}</div>
                </td>
                <td className="px-4 py-2">
                  <Badge>{blog.published ? "Published" : "Draft"}</Badge>
                </td>
                <td className="px-4 py-2">{blog.faqCount}</td>
                <td className="px-4 py-2">{new Date(blog.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/blogs/${blog.id}`}>
                      <Button size="sm" variant="outline" tone="secondary">
                        Edit
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" tone="danger" onClick={() => confirmDelete(blog)}>
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
