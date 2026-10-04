import type { StaticPage, StaticSection } from "@/lib/static-pages";

interface StaticPageBodyProps {
  page: StaticPage;
}

export function StaticPageBody({ page }: StaticPageBodyProps) {
  return (
    <>
      <h1 className="text-4xl font-bold">{page.title}</h1>
      {page.sections.map((section: StaticSection) => (
        <section key={section.heading} className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{section.heading}</h2>
          {section.body.map((paragraph: string) => (
            <p key={paragraph} className="leading-relaxed text-(--pp-muted)">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </>
  );
}
