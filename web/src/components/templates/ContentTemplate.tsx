import type { ReactNode } from "react";
import { outfit } from "@/lib/fonts";
import type { FooterGroup } from "@/lib/footer";
import type { HeaderData } from "@/lib/website-data";
import { SiteFooter, SiteHeader } from "../organisms";

interface ContentTemplateProps {
  header: HeaderData;
  shop: FooterGroup;
  children: ReactNode;
  widthClass?: string;
}

export function ContentTemplate({ header, shop, children, widthClass = "max-w-[820px]" }: ContentTemplateProps) {
  return (
    <div
      className={`pdp ${outfit.variable} flex min-h-screen flex-col bg-(--pp-bone) text-(--pp-ink)`}
      style={{ fontFamily: "var(--font-outfit), system-ui, sans-serif" }}
    >
      <SiteHeader header={header} />
      <main className={`mx-auto flex w-full ${widthClass} flex-1 flex-col gap-8 px-4 py-12 md:px-10`}>{children}</main>
      <SiteFooter shop={shop} />
    </div>
  );
}
