import { connection } from "next/server";
import { CatalogTemplate } from "@/components/templates";
import { buildCatalogData } from "@/lib/catalog";
import { buildSiteHeader } from "@/lib/home";

export default async function ProductsPage(props: PageProps<"/product">) {
  await connection();
  const [header, catalog] = await Promise.all([buildSiteHeader(), buildCatalogData(null, await props.searchParams)]);
  return catalog ? <CatalogTemplate header={header} catalog={catalog} /> : null;
}
