import type { GetStaticProps } from "next";
import { JsonLd, Seo } from "@/components/atoms";
import { HomeTemplate } from "@/components/templates";
import type { FooterGroup } from "@/lib/footer";
import { buildHomeData } from "@/lib/home";
import { isr } from "@/lib/isr";
import { faqJsonLd, siteJsonLd } from "@/lib/seo/json-ld";
import { loadShopGroup } from "@/lib/site-chrome";
import type { WebsiteData } from "@/lib/website-data";
import { storefrontFaqs } from "@/server/services/storefront-faq.service";
import type { PublicFaq } from "@/server/types/content.types";

interface HomeProps {
  data: WebsiteData;
  faqs: PublicFaq[];
  shop: FooterGroup;
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const [data, faqs, shop] = await Promise.all([buildHomeData(), storefrontFaqs.home(), loadShopGroup()]);
  return isr({ data, faqs, shop });
};

export default function Home({ data, faqs, shop }: HomeProps) {
  return (
    <>
      <Seo canonical="/" />
      <JsonLd data={[...siteJsonLd(), ...(faqs.length ? [faqJsonLd(faqs)] : [])]} />
      <HomeTemplate data={data} faqs={faqs} shop={shop} />
    </>
  );
}
