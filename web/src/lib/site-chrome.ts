import type { FooterGroup } from "@/lib/footer";
import { buildSiteHeader } from "@/lib/home";
import type { HeaderData } from "@/lib/website-data";
import { collectionController } from "@/server/controllers/collection.controller";
import type { CollectionSummary } from "@/server/types/product.types";

const MAX_SHOP_LINKS: number = 6;

export interface SiteChrome {
  header: HeaderData;
  shop: FooterGroup;
}

export const loadShopGroup = async (): Promise<FooterGroup> => {
  const collections: CollectionSummary[] = await collectionController.all();
  return {
    title: "Shop",
    links: [
      { label: "All Products", href: "/product" },
      ...collections.slice(0, MAX_SHOP_LINKS).map((collection: CollectionSummary) => ({
        label: collection.title,
        href: `/${collection.handle}`,
      })),
    ],
  };
};

export const loadSiteChrome = async (): Promise<SiteChrome> => ({
  header: buildSiteHeader(),
  shop: await loadShopGroup(),
});
