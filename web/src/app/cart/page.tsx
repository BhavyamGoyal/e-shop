import type { Metadata } from "next";
import { CartView } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { buildSiteHeader } from "@/lib/home";
import { NOT_INDEXED } from "@/lib/seo/metadata";

export const metadata: Metadata = { title: "Your cart", robots: NOT_INDEXED };

export default function CartPage() {
  return (
    <ContentTemplate header={buildSiteHeader()} widthClass="max-w-[1100px]">
      <h1 className="text-4xl font-bold">Your cart</h1>
      <CartView />
    </ContentTemplate>
  );
}
