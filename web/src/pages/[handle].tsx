import type { GetStaticPaths, GetStaticProps } from "next";
import { Seo } from "@/components/atoms";
import { MarkdownContent } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { buildCatalogData, type CatalogData } from "@/lib/catalog";
import { isr, isrNotFound } from "@/lib/isr";
import { CatalogPage } from "@/lib/seo/catalog-page";
import { pageMetadata } from "@/lib/seo/content-metadata";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";
import { collectionController } from "@/server/controllers/collection.controller";
import { storefrontPages } from "@/server/services/storefront-page.service";
import type { PublicPage } from "@/server/types/content.types";
import type { CollectionSummary } from "@/server/types/product.types";

type HandleProps = SiteChrome &
  ({ kind: "page"; page: PublicPage } | { kind: "catalog"; catalog: CatalogData; handle: string });

export const getStaticPaths: GetStaticPaths = async () => {
  const [collections, urls]: [CollectionSummary[], string[]] = await Promise.all([
    collectionController.all(),
    storefrontPages.urls(),
  ]);
  return {
    paths: [
      ...collections.map((collection: CollectionSummary) => ({ params: { handle: collection.handle } })),
      ...urls.map((handle: string) => ({ params: { handle } })),
    ],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<HandleProps> = async ({ params }) => {
  const handle: string = String(params?.handle ?? "");
  const chrome: SiteChrome = await loadSiteChrome();
  const page: PublicPage | null = await storefrontPages.findByUrl(handle);
  if (page) return isr<HandleProps>({ kind: "page", page, ...chrome });
  const catalog: CatalogData | null = await buildCatalogData(handle, {});
  return catalog ? isr<HandleProps>({ kind: "catalog", catalog, handle, ...chrome }) : isrNotFound();
};

export default function HandlePage(props: HandleProps) {
  if (props.kind === "catalog") {
    return <CatalogPage catalog={props.catalog} handle={props.handle} header={props.header} shop={props.shop} />;
  }
  return (
    <>
      <Seo {...pageMetadata(props.page)} />
      <ContentTemplate header={props.header} shop={props.shop} widthClass="max-w-[1100px]">
        <MarkdownContent content={props.page.content} />
      </ContentTemplate>
    </>
  );
}
