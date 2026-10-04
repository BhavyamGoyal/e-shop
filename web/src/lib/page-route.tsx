import type { Metadata } from "next";
import { MarkdownContent } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { pageController } from "@/server/controllers/page.controller";
import type { PublicPage } from "@/server/types/content.types";
import { buildSiteHeader } from "./home";

export const loadPage = (url: string): Promise<PublicPage | null> => pageController.findByUrl(url);

export const pageMetadata = (page: PublicPage): Metadata => ({
  title: page.title,
  description: page.description,
  alternates: { canonical: `/${page.url}` },
});

export const renderPage = (page: PublicPage) => (
  <ContentTemplate header={buildSiteHeader()}>
    <MarkdownContent content={page.content} />
  </ContentTemplate>
);
