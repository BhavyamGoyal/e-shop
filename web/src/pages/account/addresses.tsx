import type { GetStaticProps } from "next";
import { Seo } from "@/components/atoms";
import { AddressManager } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { isr } from "@/lib/isr";
import { NOINDEX } from "@/lib/seo/seo-meta";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";

export const getStaticProps: GetStaticProps<SiteChrome> = async () => isr(await loadSiteChrome());

export default function AddressesPage({ header, shop }: SiteChrome) {
  return (
    <>
      <Seo title="Your addresses" robots={NOINDEX} />
      <ContentTemplate header={header} shop={shop} widthClass="max-w-[900px]">
        <h1 className="text-4xl font-bold">Your addresses</h1>
        <AddressManager loginNext="/account/addresses" />
      </ContentTemplate>
    </>
  );
}
