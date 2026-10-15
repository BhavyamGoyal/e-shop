import type { GetStaticProps } from "next";
import { Seo } from "@/components/atoms";
import { WishlistView } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { isr } from "@/lib/isr";
import { NOINDEX } from "@/lib/seo/seo-meta";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";

export const getStaticProps: GetStaticProps<SiteChrome> = async () => isr(await loadSiteChrome());

export default function WishlistPage({ header, shop }: SiteChrome) {
  return (
    <>
      <Seo title="Your wishlist" robots={NOINDEX} />
      <ContentTemplate header={header} shop={shop} widthClass="max-w-[1100px]">
        <h1 className="text-4xl font-bold">Your wishlist</h1>
        <WishlistView />
      </ContentTemplate>
    </>
  );
}
