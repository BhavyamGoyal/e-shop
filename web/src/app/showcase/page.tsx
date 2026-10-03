import type { Metadata } from "next";
import { Heading, Text } from "@/components/atoms";
import { NOT_INDEXED } from "@/lib/seo/metadata";
import { ComponentShowcase, TokenPalette } from "@/components/organisms";
import { PageTemplate } from "@/components/templates";

export const metadata: Metadata = { title: "Showcase", robots: NOT_INDEXED };

export default function Home() {
  return (
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
  );
}
