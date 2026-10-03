import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { JsonLd } from "@/components/atoms";
import { ProductTemplate } from "@/components/templates";
import { buildSiteHeader } from "@/lib/home";
import { buildProductPage, type ProductPageData } from "@/lib/product-page";
import { breadcrumbJsonLd, productJsonLd, type Trail } from "@/lib/seo/json-ld";
import { productMetadata } from "@/lib/seo/metadata";
import { productController } from "@/server/controllers/product.controller";
import type { ProductSitemapEntry } from "@/server/repositories/product.repository";

export const revalidate = 172800;

const loadProduct = cache(async (handle: string): Promise<ProductPageData> => {
  const page: ProductPageData | null = await buildProductPage(handle);
  if (!page) notFound();
  return page;
});

const trailFor = ({ product, collection }: ProductPageData): Trail[] => [
  { name: "Home", path: "/" },
  ...(collection ? [{ name: collection.title, path: `/${collection.handle}` }] : []),
  { name: product.title, path: `/product/${product.handle}` },
];

export async function generateStaticParams(): Promise<{ handle: string }[]> {
  const entries: ProductSitemapEntry[] = await productController.sitemapEntries();
  return entries.map((entry: ProductSitemapEntry): { handle: string } => ({ handle: entry.handle }));
}

export async function generateMetadata(props: PageProps<"/product/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  return productMetadata((await loadProduct(handle)).product);
}

export default async function ProductPage(props: PageProps<"/product/[handle]">) {
  const { handle } = await props.params;
  const page: ProductPageData = await loadProduct(handle);
  return (
    <>
      <JsonLd data={[productJsonLd(page.product), breadcrumbJsonLd(trailFor(page))]} />
      <ProductTemplate header={buildSiteHeader()} {...page} />
    </>
  );
}
