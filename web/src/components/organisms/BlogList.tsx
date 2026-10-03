import Link from "next/link";
import type { PublicBlogSummary } from "@/server/types/content.types";

interface BlogListProps {
  posts: PublicBlogSummary[];
}

const formatDate = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

export function BlogList({ posts }: BlogListProps) {
  if (posts.length === 0) return <p className="text-(--pp-muted)">No posts yet. Check back soon.</p>;
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {posts.map((post: PublicBlogSummary) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="flex flex-col overflow-hidden rounded-2xl border border-(--pp-line) bg-(--pp-card) transition hover:shadow-(--pp-shadow)"
        >
          {post.coverImage ? <img src={post.coverImage} alt="" className="aspect-video w-full object-cover" /> : null}
          <div className="flex flex-col gap-2 p-5">
            <time className="text-xs font-semibold tracking-widest text-(--pp-green) uppercase">{formatDate(post.publishedAt)}</time>
            <h2 className="text-xl font-semibold text-(--pp-ink)">{post.title}</h2>
            {post.excerpt ? <p className="text-sm text-(--pp-muted)">{post.excerpt}</p> : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
