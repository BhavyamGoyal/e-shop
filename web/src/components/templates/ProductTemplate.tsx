import { Breadcrumbs, type Crumb } from "../molecules";
import { ProductRail, ProductStory, ProductView, SiteHeader } from "../organisms";
import { outfit } from "@/lib/fonts";
import type { ProductDetail } from "@/server/types/product.types";
import type { HeaderData, Product } from "@/lib/website-data";

interface ProductTemplateProps {
  header: HeaderData;
  product: ProductDetail;
  related: Product[];
  collection: { handle: string; title: string } | null;
}

const RELATED_GAP = 24;
const RELATED_VISIBLE = 4.4;
const SUMMARY_LENGTH = 180;

const buildCrumbs = (product: ProductDetail, collection: ProductTemplateProps["collection"]): Crumb[] => [
  { label: "Home", href: "/" },
  ...(collection ? [{ label: collection.title, href: `/${collection.handle}` }] : []),
  { label: product.title },
];

const summarise = (text: string): string => {
  const flat: string = text.replace(/\s+/g, " ").trim();
  return flat.length > SUMMARY_LENGTH ? `${flat.slice(0, SUMMARY_LENGTH).trimEnd()}…` : flat;
};

export function ProductTemplate({ header, product, related, collection }: ProductTemplateProps) {
  return (
    <div
      className={`pdp ${outfit.variable} flex min-h-screen flex-col bg-(--pp-bone) pb-20 text-(--pp-ink) lg:pb-0`}
      style={{ fontFamily: "var(--font-outfit), system-ui, sans-serif" }}
    >
      <SiteHeader header={header} />
      <main className="flex-1">
        <ProductView
          title={product.title}
          summary={summarise(product.descriptionText)}
          breadcrumbs={<Breadcrumbs items={buildCrumbs(product, collection)} />}
          images={product.images}
          options={product.options}
          variants={product.variants}
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          available={product.available}
        />
        {product.descriptionHtml && <ProductStory html={product.descriptionHtml} />}
        {related.length > 0 && (
          <section className="mx-auto w-full max-w-[1280px] px-4 pb-16 md:px-10">
            <h2 className="mb-6 text-2xl font-semibold">You may also like</h2>
            <ProductRail products={related} gap={RELATED_GAP} visible={RELATED_VISIBLE} />
          </section>
        )}
      </main>
    </div>
  );
}
