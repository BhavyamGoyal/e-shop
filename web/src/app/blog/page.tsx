import type { Metadata } from "next";
import { BlogList } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { buildSiteHeader } from "@/lib/home";
import { SITE_NAME } from "@/lib/site";
import { blogController } from "@/server/controllers/blog.controller";

export const revalidate = 172800;

export const metadata: Metadata = {
  title: "Blog",
  description: `Stories, guides and ideas from ${SITE_NAME}.`,
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  return (
    <ContentTemplate header={buildSiteHeader()}>
      <h1 className="text-4xl font-bold">Blog</h1>
      <BlogList posts={await blogController.published()} />
    </ContentTemplate>
  );
}
