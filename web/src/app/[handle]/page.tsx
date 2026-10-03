import type { Metadata } from "next";
import { CatalogPage, loadCatalog } from "@/lib/seo/catalog-page";
import { catalogMetadata } from "@/lib/seo/metadata";
import { collectionController } from "@/server/controllers/collection.controller";
import type { CollectionSummary } from "@/server/types/product.types";

export const revalidate = 172800;

export async function generateStaticParams(): Promise<{ handle: string }[]> {
  const collections: CollectionSummary[] = await collectionController.all();
  return collections.map((collection: CollectionSummary): { handle: string } => ({ handle: collection.handle }));
}

export async function generateMetadata(props: PageProps<"/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  return catalogMetadata(await loadCatalog(handle, {}), false);
}

export default async function CollectionPage(props: PageProps<"/[handle]">) {
  const { handle } = await props.params;
  return <CatalogPage catalog={await loadCatalog(handle, {})} handle={handle} />;
}
