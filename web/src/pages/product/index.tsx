import type { GetStaticProps } from "next";
import { buildCatalogData, type CatalogData } from "@/lib/catalog";
import { isr, isrNotFound } from "@/lib/isr";
import { CatalogPage } from "@/lib/seo/catalog-page";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";

interface ProductsProps extends SiteChrome {
  catalog: CatalogData;
}

export const getStaticProps: GetStaticProps<ProductsProps> = async () => {
  const [catalog, chrome] = await Promise.all([buildCatalogData(null, {}), loadSiteChrome()]);
  return catalog ? isr({ catalog, ...chrome }) : isrNotFound();
};

export default function ProductsPage({ catalog, header, shop }: ProductsProps) {
  return <CatalogPage catalog={catalog} handle={null} header={header} shop={shop} />;
}
