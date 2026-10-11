import type { GetStaticProps } from "next";
import Link from "next/link";
import { Seo } from "@/components/atoms";
import { ProfileForm } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { isr } from "@/lib/isr";
import { NOINDEX } from "@/lib/seo/seo-meta";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";

export const getStaticProps: GetStaticProps<SiteChrome> = async () => isr(await loadSiteChrome());

export default function ProfilePage({ header, shop }: SiteChrome) {
  return (
    <>
      <Seo title="Your profile" robots={NOINDEX} />
      <ContentTemplate header={header} shop={shop} widthClass="max-w-[900px]">
        <div className="flex flex-col gap-1">
          <Link href="/account" className="text-sm text-muted-foreground hover:underline">Your account</Link>
          <h1 className="text-4xl font-bold">Your profile</h1>
        </div>
        <ProfileForm loginNext="/account/profile" />
      </ContentTemplate>
    </>
  );
}
