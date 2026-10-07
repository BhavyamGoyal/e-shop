import type { Metadata } from "next";
import { CatalogPage, loadTagCatalog } from "@/lib/seo/catalog-page";
import { catalogMetadata } from "@/lib/seo/metadata";
import { storefrontTagController } from "@/server/controllers/storefront-tag.controller";

export const revalidate = 604800;

export async function generateStaticParams(): Promise<{ tag: string }[]> {
  const names: string[] = await storefrontTagController.names();
  return names.map((tag: string): { tag: string } => ({ tag }));
}

export async function generateMetadata(props: PageProps<"/products/[tag]">): Promise<Metadata> {
  const { tag } = await props.params;
  return catalogMetadata(await loadTagCatalog(decodeURIComponent(tag)), false);
}

export default async function TagProductsPage(props: PageProps<"/products/[tag]">) {
  const { tag } = await props.params;
  return <CatalogPage catalog={await loadTagCatalog(decodeURIComponent(tag))} handle={decodeURIComponent(tag)} />;
}
