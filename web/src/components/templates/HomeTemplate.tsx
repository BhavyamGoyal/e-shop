import type { PublicFaq } from "@/server/types/content.types";
import { FaqAccordion, HomeSection, SiteHeader } from "../organisms";
import type { WebsiteData } from "@/lib/website-data";

interface HomeTemplateProps {
  data: WebsiteData;
  faqs: PublicFaq[];
}

export function HomeTemplate({ data, faqs }: HomeTemplateProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader header={data.header} />
      <main className="flex-1 pb-16">
        {data.sections.map((section) => (
          <HomeSection key={section.key} section={section} />
        ))}
        {faqs.length > 0 && (
          <section className="pdp mx-auto w-full max-w-[820px] px-6 pt-12 md:px-10">
            <h2 className="mb-6 text-2xl font-semibold">Frequently asked questions</h2>
            <FaqAccordion faqs={faqs} />
          </section>
        )}
      </main>
    </div>
  );
}
