import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { JsonLd } from "@/components/atoms";
import { BlogArticle } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { buildSiteHeader } from "@/lib/home";
import { blogMetadata } from "@/lib/seo/content-metadata";
import { blogPostJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/json-ld";
import { blogController } from "@/server/controllers/blog.controller";
import type { BlogSitemapEntry, PublicBlog } from "@/server/types/content.types";

export const revalidate = 172800;

const loadPost = cache(async (slug: string): Promise<PublicBlog> => {
  const post: PublicBlog | null = await blogController.publicBySlug(slug);
  if (!post) notFound();
  return post;
});

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const entries: BlogSitemapEntry[] = await blogController.sitemapEntries();
  return entries.map((entry: BlogSitemapEntry): { slug: string } => ({ slug: entry.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  return blogMetadata(await loadPost(slug));
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post: PublicBlog = await loadPost(slug);
  const trail = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ];
  return (
    <ContentTemplate header={buildSiteHeader()}>
      <JsonLd data={[blogPostJsonLd(post), breadcrumbJsonLd(trail), ...(post.faqs.length ? [faqJsonLd(post.faqs)] : [])]} />
      <BlogArticle post={post} />
    </ContentTemplate>
  );
}
