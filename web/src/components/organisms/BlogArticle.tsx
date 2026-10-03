import type { PublicBlog } from "@/server/types/content.types";
import { FaqAccordion } from "./FaqAccordion";

interface BlogArticleProps {
  post: PublicBlog;
}

const formatDate = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

export function BlogArticle({ post }: BlogArticleProps) {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <time className="text-xs font-semibold tracking-widest text-(--pp-green) uppercase">{formatDate(post.publishedAt)}</time>
        <h1 className="text-4xl leading-tight font-bold">{post.title}</h1>
        {post.excerpt ? <p className="text-lg text-(--pp-muted)">{post.excerpt}</p> : null}
      </header>
      {post.coverImage ? <img src={post.coverImage} alt="" className="w-full rounded-2xl object-cover" /> : null}
      <div className="pdp-prose text-[17px] leading-[1.75]" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
      {post.faqs.length > 0 ? (
        <section className="flex flex-col gap-4 border-t border-(--pp-line-soft) pt-8">
          <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
          <FaqAccordion faqs={post.faqs} />
        </section>
      ) : null}
    </article>
  );
}
