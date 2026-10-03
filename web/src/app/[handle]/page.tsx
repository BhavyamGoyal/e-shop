import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CatalogTemplate } from "@/components/templates";
import { buildCatalogData } from "@/lib/catalog";
import { buildSiteHeader } from "@/lib/home";

export default async function CollectionPage(props: PageProps<"/[handle]">) {
  await connection();
  const { handle } = await props.params;
  const [header, catalog] = await Promise.all([
    buildSiteHeader(),
    buildCatalogData(handle, await props.searchParams),
  ]);
  if (!catalog) notFound();
  return <CatalogTemplate header={header} catalog={catalog} />;
}
