import type { Metadata } from "next";
import { loadPage, pageMetadata, renderPage } from "@/lib/page-route";
import { CatalogPage, loadCatalog } from "@/lib/seo/catalog-page";
import { catalogMetadata } from "@/lib/seo/metadata";
import type { PublicPage } from "@/server/types/content.types";

type QueryPageProps = PageProps<"/catalog-query/[[...handle]]">;

const handleOf = async (props: QueryPageProps): Promise<string | null> => (await props.params).handle?.[0] ?? null;

const pageOf = async (handle: string | null): Promise<PublicPage | null> => (handle ? loadPage(handle) : null);

export async function generateMetadata(props: QueryPageProps): Promise<Metadata> {
  const handle: string | null = await handleOf(props);
  const page: PublicPage | null = await pageOf(handle);
  return page ? pageMetadata(page) : catalogMetadata(await loadCatalog(handle, await props.searchParams), true);
}

export default async function CatalogQueryPage(props: QueryPageProps) {
  const handle: string | null = await handleOf(props);
  const page: PublicPage | null = await pageOf(handle);
  if (page) return renderPage(page);
  return <CatalogPage catalog={await loadCatalog(handle, await props.searchParams)} handle={handle} />;
}
