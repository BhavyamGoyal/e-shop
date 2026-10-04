import type { Metadata } from "next";
import { renderStaticPage, staticPageMetadata } from "@/lib/static-page-route";

const SLUG: string = "refund-policy";

export const metadata: Metadata = staticPageMetadata(SLUG);

export default function Page() {
  return renderStaticPage(SLUG);
}
