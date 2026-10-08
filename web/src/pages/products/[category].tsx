import type { GetStaticPaths, GetStaticProps } from "next";
import { buildCategoryCatalogData, type CatalogData } from "@/lib/catalog";
import { isr, isrNotFound } from "@/lib/isr";
import { CatalogPage } from "@/lib/seo/catalog-page";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";
import { storefrontCategoryController } from "@/server/controllers/storefront-category.controller";

interface CategoryProps extends SiteChrome {
  catalog: CatalogData;
  slug: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs: string[] = await storefrontCategoryController.slugs();
  return { paths: slugs.map((category: string) => ({ params: { category } })), fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<CategoryProps> = async ({ params }) => {
  const slug: string = decodeURIComponent(String(params?.category ?? ""));
  const [catalog, chrome] = await Promise.all([buildCategoryCatalogData(slug), loadSiteChrome()]);
  return catalog ? isr({ catalog, slug, ...chrome }) : isrNotFound();
};

export default function CategoryProductsPage({ catalog, slug, header, shop }: CategoryProps) {
  return <CatalogPage catalog={catalog} handle={slug} header={header} shop={shop} />;
}
