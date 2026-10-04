import type { Metadata } from "next";
import { StaticPageBody } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { buildSiteHeader } from "./home";
import { findStaticPage, type StaticPage } from "./static-pages";

export const staticPageMetadata = (slug: string): Metadata => {
  const page: StaticPage = findStaticPage(slug);
  return { title: page.title, description: page.description, alternates: { canonical: `/${slug}` } };
};

export const renderStaticPage = (slug: string) => (
  <ContentTemplate header={buildSiteHeader()}>
    <StaticPageBody page={findStaticPage(slug)} />
  </ContentTemplate>
);
