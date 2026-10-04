import type { Metadata } from "next";
import { CatalogPage, loadCatalog } from "@/lib/seo/catalog-page";
import { catalogMetadata } from "@/lib/seo/metadata";
import { loadPage, pageMetadata, renderPage } from "@/lib/page-route";
import { collectionController } from "@/server/controllers/collection.controller";
import { pageController } from "@/server/controllers/page.controller";
import type { PublicPage } from "@/server/types/content.types";
import type { CollectionSummary } from "@/server/types/product.types";

export const revalidate = 172800;

export async function generateStaticParams(): Promise<{ handle: string }[]> {
  const [collections, urls]: [CollectionSummary[], string[]] = await Promise.all([
    collectionController.all(),
    pageController.urls(),
  ]);
  return [
    ...collections.map((collection: CollectionSummary): { handle: string } => ({ handle: collection.handle })),
    ...urls.map((url: string): { handle: string } => ({ handle: url })),
  ];
}

export async function generateMetadata(props: PageProps<"/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const page: PublicPage | null = await loadPage(handle);
  return page ? pageMetadata(page) : catalogMetadata(await loadCatalog(handle, {}), false);
}

export default async function HandlePage(props: PageProps<"/[handle]">) {
  const { handle } = await props.params;
  const page: PublicPage | null = await loadPage(handle);
  if (page) return renderPage(page);
  return <CatalogPage catalog={await loadCatalog(handle, {})} handle={handle} />;
}
