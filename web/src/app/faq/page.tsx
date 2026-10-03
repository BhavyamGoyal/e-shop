import type { Metadata } from "next";
import { JsonLd } from "@/components/atoms";
import { FaqAccordion } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { buildSiteHeader } from "@/lib/home";
import { faqJsonLd } from "@/lib/seo/json-ld";
import { SITE_NAME } from "@/lib/site";
import { faqController } from "@/server/controllers/faq.controller";
import type { PublicFaq } from "@/server/types/content.types";

export const revalidate = 172800;

export const metadata: Metadata = {
  title: "FAQ",
  description: `Answers to common questions about ${SITE_NAME}.`,
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const faqs: PublicFaq[] = await faqController.general();
  return (
    <ContentTemplate header={buildSiteHeader()}>
      {faqs.length ? <JsonLd data={faqJsonLd(faqs)} /> : null}
      <h1 className="text-4xl font-bold">Frequently asked questions</h1>
      {faqs.length ? <FaqAccordion faqs={faqs} /> : <p className="text-(--pp-muted)">No questions yet.</p>}
    </ContentTemplate>
  );
}
