import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import type { PublicBlog } from "@/server/types/content.types";

const TITLE_LIMIT = 70;
const DESCRIPTION_LIMIT = 160;

const clip = (text: string, limit: number): string => {
  const flat: string = text.replace(/\s+/g, " ").trim();
  return flat.length > limit ? `${flat.slice(0, limit - 1).trimEnd()}…` : flat;
};

export function blogMetadata(post: PublicBlog): Metadata {
  const path: string = `/blog/${post.slug}`;
  const title: string = clip(post.seoTitle ?? post.title, TITLE_LIMIT);
  const description: string = clip(post.seoDescription ?? post.excerpt, DESCRIPTION_LIMIT);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: post.coverImage ? [post.coverImage] : undefined },
  };
}
