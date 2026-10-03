import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProductTemplate } from "@/components/templates";
import { buildSiteHeader } from "@/lib/home";
import { buildProductPage } from "@/lib/product-page";

export default async function ProductPage(props: PageProps<"/product/[handle]">) {
  await connection();
  const { handle } = await props.params;
  const [header, page] = await Promise.all([buildSiteHeader(), buildProductPage(handle)]);
  if (!page) notFound();
  return <ProductTemplate header={header} {...page} />;
}
