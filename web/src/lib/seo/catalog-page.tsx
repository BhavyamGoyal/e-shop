import { JsonLd, Seo } from "@/components/atoms";
import { CatalogTemplate } from "@/components/templates";
import type { CatalogData } from "@/lib/catalog";
import type { FooterGroup } from "@/lib/footer";
import { breadcrumbJsonLd, collectionJsonLd, type Trail } from "@/lib/seo/json-ld";
import { catalogMetadata } from "@/lib/seo/metadata";
import type { HeaderData } from "@/lib/website-data";

const trailFor = (catalog: CatalogData, handle: string | null): Trail[] => [
  { name: "Home", path: "/" },
  ...(handle ? [{ name: "All Products", path: "/product" }] : []),
  { name: catalog.title, path: catalog.basePath },
];

export interface CatalogPageProps {
  catalog: CatalogData;
  handle: string | null;
  header: HeaderData;
  shop: FooterGroup;
}

export function CatalogPage({ catalog, handle, header, shop }: CatalogPageProps) {
  return (
    <>
      <Seo {...catalogMetadata(catalog)} />
      <JsonLd
        data={[
          collectionJsonLd(catalog.title, catalog.description, catalog.basePath, catalog.products),
          breadcrumbJsonLd(trailFor(catalog, handle)),
        ]}
      />
      <CatalogTemplate header={header} shop={shop} catalog={catalog} />
    </>
  );
}
