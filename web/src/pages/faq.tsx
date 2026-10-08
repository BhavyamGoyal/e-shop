import type { GetStaticProps } from "next";
import { JsonLd, Seo } from "@/components/atoms";
import { FaqAccordion } from "@/components/organisms";
import { ContentTemplate } from "@/components/templates";
import { isr } from "@/lib/isr";
import { faqJsonLd } from "@/lib/seo/json-ld";
import { SITE_NAME } from "@/lib/site";
import { loadSiteChrome, type SiteChrome } from "@/lib/site-chrome";
import { storefrontFaqs } from "@/server/services/storefront-faq.service";
import type { PublicFaq } from "@/server/types/content.types";

interface FaqProps extends SiteChrome {
  faqs: PublicFaq[];
}

export const getStaticProps: GetStaticProps<FaqProps> = async () => {
  const [faqs, chrome] = await Promise.all([storefrontFaqs.general(), loadSiteChrome()]);
  return isr({ faqs, ...chrome });
};

export default function FaqPage({ faqs, header, shop }: FaqProps) {
  return (
    <>
      <Seo title="FAQ" description={`Answers to common questions about ${SITE_NAME}.`} canonical="/faq" />
      <ContentTemplate header={header} shop={shop}>
        {faqs.length ? <JsonLd data={faqJsonLd(faqs)} /> : null}
        <h1 className="text-4xl font-bold">Frequently asked questions</h1>
        {faqs.length ? <FaqAccordion faqs={faqs} /> : <p className="text-(--pp-muted)">No questions yet.</p>}
      </ContentTemplate>
    </>
  );
}
