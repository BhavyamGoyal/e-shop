import type { Metadata } from "next";
import { CatalogPage, loadCatalog } from "@/lib/seo/catalog-page";
import { catalogMetadata } from "@/lib/seo/metadata";

type QueryPageProps = PageProps<"/catalog-query/[[...handle]]">;

const handleOf = async (props: QueryPageProps): Promise<string | null> => (await props.params).handle?.[0] ?? null;

export async function generateMetadata(props: QueryPageProps): Promise<Metadata> {
  return catalogMetadata(await loadCatalog(await handleOf(props), await props.searchParams), true);
}

export default async function CatalogQueryPage(props: QueryPageProps) {
  const handle: string | null = await handleOf(props);
  return <CatalogPage catalog={await loadCatalog(handle, await props.searchParams)} handle={handle} />;
}
