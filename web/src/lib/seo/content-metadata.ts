import type { PublicBlog, PublicPage } from "@/server/types/content.types";
import type { SeoMeta } from "./seo-meta";

const TITLE_LIMIT = 70;
const DESCRIPTION_LIMIT = 160;

const clip = (text: string, limit: number): string => {
  const flat: string = text.replace(/\s+/g, " ").trim();
  return flat.length > limit ? `${flat.slice(0, limit - 1).trimEnd()}…` : flat;
};

export const pageMetadata = (page: PublicPage): SeoMeta => ({
  title: page.title,
  description: page.description,
  canonical: `/${page.url}`,
});

export function blogMetadata(post: PublicBlog): SeoMeta {
  return {
    title: clip(post.seoTitle ?? post.title, TITLE_LIMIT),
    description: clip(post.seoDescription ?? post.excerpt, DESCRIPTION_LIMIT),
    canonical: `/blog/${post.slug}`,
    image: post.coverImage ?? undefined,
    ogType: "article",
    publishedTime: post.publishedAt ?? undefined,
    modifiedTime: post.updatedAt,
  };
}
