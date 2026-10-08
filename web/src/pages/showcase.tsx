import { Heading, Seo, Text } from "@/components/atoms";
import { ComponentShowcase, TokenPalette } from "@/components/organisms";
import { PageTemplate } from "@/components/templates";
import { NOINDEX } from "@/lib/seo/seo-meta";

export { staticPage as getStaticProps } from "@/lib/isr";

export default function ShowcasePage() {
  return (
    <>
      <Seo title="Showcase" robots={NOINDEX} />
      <PageTemplate title="Ecommerce">
        <section className="flex flex-col gap-3">
          <Heading level={1}>Themeable storefront</Heading>
          <Text tone="muted" className="max-w-2xl text-lg">
            Every colour comes from a semantic token. Pick a theme above to restyle the whole app.
          </Text>
        </section>
        <div className="grid gap-6 lg:grid-cols-2">
          <ComponentShowcase />
          <TokenPalette />
        </div>
      </PageTemplate>
    </>
  );
}
