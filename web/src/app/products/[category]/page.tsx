import type { Metadata } from "next";
import { CatalogPage, loadCategoryCatalog } from "@/lib/seo/catalog-page";
import { catalogMetadata } from "@/lib/seo/metadata";
import { storefrontCategoryController } from "@/server/controllers/storefront-category.controller";

export const revalidate = 604800;

export async function generateStaticParams(): Promise<{ category: string }[]> {
  const slugs: string[] = await storefrontCategoryController.slugs();
  return slugs.map((category: string): { category: string } => ({ category }));
}

export async function generateMetadata(props: PageProps<"/products/[category]">): Promise<Metadata> {
  const { category } = await props.params;
  return catalogMetadata(await loadCategoryCatalog(decodeURIComponent(category)), false);
}

export default async function CategoryProductsPage(props: PageProps<"/products/[category]">) {
  const { category } = await props.params;
  const slug: string = decodeURIComponent(category);
  return <CatalogPage catalog={await loadCategoryCatalog(slug)} handle={slug} />;
}
