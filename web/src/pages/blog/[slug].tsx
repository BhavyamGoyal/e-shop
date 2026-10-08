import type { GetStaticPaths, GetStaticProps } from "next";
import { JsonLd, Seo } from "@/components/atoms";
import { BlogArticle } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { isr, isrNotFound } from "@/lib/isr";
import { blogMetadata } from "@/lib/seo/content-metadata";
import { blogPostJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/json-ld";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";
import { storefrontBlogs } from "@/server/services/storefront-blog.service";
import type { BlogSitemapEntry, PublicBlog } from "@/server/types/content.types";

interface BlogPostProps extends SiteChrome {
  post: PublicBlog;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const entries: BlogSitemapEntry[] = await storefrontBlogs.sitemapEntries();
  return {
    paths: entries.map((entry: BlogSitemapEntry) => ({ params: { slug: entry.slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<BlogPostProps> = async ({ params }) => {
  const [post, chrome] = await Promise.all([
    storefrontBlogs.publicBySlug(String(params?.slug ?? "")),
    loadSiteChrome(),
  ]);
  return post ? isr({ post, ...chrome }) : isrNotFound();
};

export default function BlogPostPage({ post, header, shop }: BlogPostProps) {
  const trail = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ];
  return (
    <>
      <Seo {...blogMetadata(post)} />
      <ContentTemplate header={header} shop={shop}>
        <JsonLd data={[blogPostJsonLd(post), breadcrumbJsonLd(trail), ...(post.faqs.length ? [faqJsonLd(post.faqs)] : [])]} />
        <BlogArticle post={post} />
      </ContentTemplate>
    </>
  );
}
