import type { Metadata } from "next";
import { CatalogPage, loadCatalog } from "@/lib/seo/catalog-page";
import { catalogMetadata } from "@/lib/seo/metadata";

export const revalidate = 172800;

export async function generateMetadata(): Promise<Metadata> {
  return catalogMetadata(await loadCatalog(null, {}), false);
}

export default async function ProductsPage() {
  return <CatalogPage catalog={await loadCatalog(null, {})} handle={null} />;
}
