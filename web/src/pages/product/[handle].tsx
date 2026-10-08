import type { GetStaticPaths, GetStaticProps } from "next";
import { JsonLd, Seo } from "@/components/atoms";
import { ProductTemplate } from "@/components/templates";
import { isr, isrNotFound } from "@/lib/isr";
import { buildProductPage, type ProductPageData } from "@/lib/product-page";
import { breadcrumbJsonLd, productJsonLd, type Trail } from "@/lib/seo/json-ld";
import { productMetadata } from "@/lib/seo/metadata";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";
import { productController } from "@/server/controllers/product.controller";
import type { ProductSitemapEntry } from "@/server/repositories/product.repository";

type ProductProps = ProductPageData & SiteChrome;

const trailFor = ({ product, collection }: ProductPageData): Trail[] => [
  { name: "Home", path: "/" },
  ...(collection ? [{ name: collection.title, path: `/${collection.handle}` }] : []),
  { name: product.title, path: `/product/${product.handle}` },
];

export const getStaticPaths: GetStaticPaths = async () => {
  const entries: ProductSitemapEntry[] = await productController.sitemapEntries();
  return {
    paths: entries.map((entry: ProductSitemapEntry) => ({ params: { handle: entry.handle } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<ProductProps> = async ({ params }) => {
  const [page, chrome] = await Promise.all([buildProductPage(String(params?.handle ?? "")), loadSiteChrome()]);
  return page ? isr({ ...page, ...chrome }) : isrNotFound();
};

export default function ProductPage({ header, shop, ...page }: ProductProps) {
  return (
    <>
      <Seo {...productMetadata(page.product)} />
      <JsonLd data={[productJsonLd(page.product), breadcrumbJsonLd(trailFor(page))]} />
      <ProductTemplate header={header} shop={shop} {...page} />
    </>
  );
}
