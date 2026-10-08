import type { GetStaticProps } from "next";
import { Seo } from "@/components/atoms";
import { CartView } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { isr } from "@/lib/isr";
import { NOINDEX } from "@/lib/seo/seo-meta";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";

export const getStaticProps: GetStaticProps<SiteChrome> = async () => isr(await loadSiteChrome());

export default function CartPage({ header, shop }: SiteChrome) {
  return (
    <>
      <Seo title="Your cart" robots={NOINDEX} />
      <ContentTemplate header={header} shop={shop} widthClass="max-w-[1100px]">
        <h1 className="text-4xl font-bold">Your cart</h1>
        <CartView />
      </ContentTemplate>
    </>
  );
}
