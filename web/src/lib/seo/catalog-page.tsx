import { notFound } from "next/navigation";
import { JsonLd } from "@/components/atoms";
import { CatalogTemplate } from "@/components/templates";
import { buildCatalogData, buildTagCatalogData, type CatalogData } from "@/lib/catalog";
import type { RawParams } from "@/lib/catalog-url";
import { buildSiteHeader } from "@/lib/home";
import { breadcrumbJsonLd, collectionJsonLd, type Trail } from "@/lib/seo/json-ld";

export const loadCatalog = async (handle: string | null, raw: RawParams): Promise<CatalogData> => {
  const catalog: CatalogData | null = await buildCatalogData(handle, raw);
  if (!catalog) notFound();
  return catalog;
};

export const loadTagCatalog = async (tag: string): Promise<CatalogData> => {
  const catalog: CatalogData | null = await buildTagCatalogData(tag);
  if (!catalog) notFound();
  return catalog;
};

const trailFor =(catalog: CatalogData, handle: string | null): Trail[] => [
  { name: "Home", path: "/" },
  ...(handle ? [{ name: "All Products", path: "/product" }] : []),
  { name: catalog.title, path: catalog.basePath },
];

interface CatalogPageProps {
  catalog: CatalogData;
  handle: string | null;
}

export function CatalogPage({ catalog, handle }: CatalogPageProps) {
  return (
    <>
      <JsonLd
        data={[
          collectionJsonLd(catalog.title, catalog.description, catalog.basePath, catalog.products),
          breadcrumbJsonLd(trailFor(catalog, handle)),
        ]}
      />
      <CatalogTemplate header={buildSiteHeader()} catalog={catalog} />
    </>
  );
}
