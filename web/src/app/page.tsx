import type { Metadata } from "next";
import { JsonLd } from "@/components/atoms";
import { HomeTemplate } from "@/components/templates";
import { buildHomeData } from "@/lib/home";
import { faqJsonLd, siteJsonLd } from "@/lib/seo/json-ld";
import { faqController } from "@/server/controllers/faq.controller";

export const revalidate = 172800;

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [data, faqs] = await Promise.all([buildHomeData(), faqController.home()]);
  return (
    <>
      <JsonLd data={[...siteJsonLd(), ...(faqs.length ? [faqJsonLd(faqs)] : [])]} />
      <HomeTemplate data={data} faqs={faqs} />
    </>
  );
}
