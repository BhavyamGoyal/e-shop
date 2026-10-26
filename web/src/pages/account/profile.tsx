import type { GetStaticProps } from "next";
import { Seo } from "@/components/atoms";
import { AccountShell, ProfileForm } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { isr } from "@/lib/isr";
import { NOINDEX } from "@/lib/seo/seo-meta";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";

export const getStaticProps: GetStaticProps<SiteChrome> = async () => isr(await loadSiteChrome());

export default function ProfilePage({ header, shop }: SiteChrome) {
  return (
    <>
      <Seo title="Your profile" robots={NOINDEX} />
      <ContentTemplate header={header} shop={shop} widthClass="max-w-[1120px]">
        <AccountShell current="/account/profile">
          <h1 className="text-3xl font-bold">Your profile</h1>
          <ProfileForm loginNext="/account/profile" />
        </AccountShell>
      </ContentTemplate>
    </>
  );
}
