import { HomeSection, SiteHeader } from "../organisms";
import type { WebsiteData } from "@/lib/website-data";

interface HomeTemplateProps {
  data: WebsiteData;
}

export function HomeTemplate({ data }: HomeTemplateProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#191a0b]">
      <SiteHeader header={data.header} />
      <main className="flex-1 pb-16">
        {data.sections.map((section) => (
          <HomeSection key={section.key} section={section} />
        ))}
      </main>
    </div>
  );
}
