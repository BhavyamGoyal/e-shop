import type { GetStaticProps } from "next";
import type { ReactNode } from "react";
import { Seo } from "@/components/atoms";
import { AccountTile } from "@/components/molecules";
import { ContentTemplate } from "@/components/templates";
import { isr } from "@/lib/isr";
import { NOINDEX } from "@/lib/seo/seo-meta";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";

const icon = (path: string): ReactNode => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6" aria-hidden="true">
    <path d={path} />
  </svg>
);

const TILES: { href: string; title: string; description: string; icon: ReactNode }[] = [
  { href: "/account/orders", title: "Your orders", description: "Track current orders and view past purchases", icon: icon("M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10") },
  { href: "/account/profile", title: "Your profile", description: "Update your name and see your sign-in details", icon: icon("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0") },
  { href: "/account/addresses", title: "Your addresses", description: "Add, edit or remove delivery addresses", icon: icon("M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11ZM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z") },
];

export const getStaticProps: GetStaticProps<SiteChrome> = async () => isr(await loadSiteChrome());

export default function AccountPage({ header, shop }: SiteChrome) {
  return (
    <>
      <Seo title="Your account" robots={NOINDEX} />
      <ContentTemplate header={header} shop={shop} widthClass="max-w-[900px]">
        <h1 className="text-4xl font-bold">Your account</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {TILES.map((tile) => (
            <AccountTile key={tile.href} {...tile} />
          ))}
        </div>
      </ContentTemplate>
    </>
  );
}
