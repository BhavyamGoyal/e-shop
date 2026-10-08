import type { PostRow } from "@/server/types/instagram.types";
import { Heading, Text } from "../atoms";

const COLUMNS: { key: keyof PostRow; label: string }[] = [
  { key: "views", label: "Views" },
  { key: "reach", label: "Reach" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
  { key: "saves", label: "Saves" },
  { key: "shares", label: "Shares" },
];

export function InstagramPostsTable({ posts }: { posts: PostRow[] }) {
  return (
    <section className="flex flex-col gap-3">
      <Heading level={3}>Posts</Heading>
      {posts.length === 0 ? <Text tone="muted">No posts yet.</Text> : null}
      {posts.length > 0 ? (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Post</th>
                <th className="px-4 py-2 font-medium">Published</th>
                {COLUMNS.map((column) => (
                  <th key={column.key} className="px-4 py-2 text-right font-medium">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post: PostRow) => (
                <tr key={post.id} className="border-t align-top">
                  <td className="max-w-xs px-4 py-2">
                    <a href={post.permalink || undefined} target="_blank" rel="noreferrer" className="hover:text-primary">
                      {post.caption.slice(0, 80) || post.mediaType || "Untitled"}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">{new Date(post.date).toLocaleDateString()}</td>
                  {COLUMNS.map((column) => (
                    <td key={column.key} className="px-4 py-2 text-right">
                      {Number(post[column.key]).toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
