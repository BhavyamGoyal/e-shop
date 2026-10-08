import type { GetStaticProps } from "next";
import { Seo } from "@/components/atoms";
import { BlogList } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { isr } from "@/lib/isr";
import { SITE_NAME } from "@/lib/site";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";
import { storefrontBlogs } from "@/server/services/storefront-blog.service";
import type { PublicBlogSummary } from "@/server/types/content.types";

interface BlogIndexProps extends SiteChrome {
  posts: PublicBlogSummary[];
}

export const getStaticProps: GetStaticProps<BlogIndexProps> = async () => {
  const [posts, chrome] = await Promise.all([storefrontBlogs.published(), loadSiteChrome()]);
  return isr({ posts, ...chrome });
};

export default function BlogIndexPage({ posts, header, shop }: BlogIndexProps) {
  return (
    <>
      <Seo title="Blog" description={`Stories, guides and ideas from ${SITE_NAME}.`} canonical="/blog" />
      <ContentTemplate header={header} shop={shop}>
        <h1 className="text-4xl font-bold">Blog</h1>
        <BlogList posts={posts} />
      </ContentTemplate>
    </>
  );
}
