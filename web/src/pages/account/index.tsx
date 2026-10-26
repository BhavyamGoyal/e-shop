import type { GetStaticProps } from "next";
import { Seo } from "@/components/atoms";
import { AccountDashboard, AccountShell } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { isr } from "@/lib/isr";
import { NOINDEX } from "@/lib/seo/seo-meta";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";

export const getStaticProps: GetStaticProps<SiteChrome> = async () => isr(await loadSiteChrome());

export default function AccountPage({ header, shop }: SiteChrome) {
  return (
    <>
      <Seo title="Your account" robots={NOINDEX} />
      <ContentTemplate header={header} shop={shop} widthClass="max-w-[1120px]">
        <AccountShell current="/account">
          <AccountDashboard />
        </AccountShell>
      </ContentTemplate>
    </>
  );
}
