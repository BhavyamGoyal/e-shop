import { INSTAGRAM_URL, LOGO_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import type { Product } from "@/lib/website-data";
import type { PublicBlog, PublicFaq } from "@/server/types/content.types";
import type { ProductDetail, ProductVariant } from "@/server/types/product.types";

export interface Trail {
  name: string;
  path: string;
}

type JsonLdNode = Record<string, unknown>;

const CONTEXT = "https://schema.org";

const availability = (available: boolean): string =>
  `${CONTEXT}/${available ? "InStock" : "OutOfStock"}`;

export const breadcrumbJsonLd = (trail: Trail[]): JsonLdNode => ({
  "@context": CONTEXT,
  "@type": "BreadcrumbList",
  itemListElement: trail.map((item: Trail, index: number): JsonLdNode => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

const variantOffer = (product: ProductDetail, variant: ProductVariant): JsonLdNode => ({
  "@type": "Offer",
  url: absoluteUrl(`/product/${product.handle}`),
  sku: variant.sku ?? undefined,
  name: variant.title,
  price: variant.price,
  priceCurrency: product.currency,
  availability: availability(variant.available),
  itemCondition: `${CONTEXT}/NewCondition`,
});

const productOffers = (product: ProductDetail): JsonLdNode | JsonLdNode[] => {
  if (product.variants.length > 1) {
    return {
      "@type": "AggregateOffer",
      priceCurrency: product.currency,
      lowPrice: product.price,
      highPrice: product.priceMax,
      offerCount: product.variants.length,
      availability: availability(product.available),
      offers: product.variants.map((variant: ProductVariant): JsonLdNode => variantOffer(product, variant)),
    };
  }
  return {
    "@type": "Offer",
    url: absoluteUrl(`/product/${product.handle}`),
    price: product.price,
    priceCurrency: product.currency,
    availability: availability(product.available),
    itemCondition: `${CONTEXT}/NewCondition`,
  };
};

export const productJsonLd = (product: ProductDetail): JsonLdNode => ({
  "@context": CONTEXT,
  "@type": "Product",
  "@id": absoluteUrl(`/product/${product.handle}#product`),
  name: product.title,
  description: product.seo.description ?? product.descriptionText,
  url: absoluteUrl(`/product/${product.handle}`),
  image: product.images.map((image): string => absoluteUrl(image.url)),
  sku: product.variants[0]?.sku ?? String(product.id),
  category: product.productType ?? undefined,
  brand: { "@type": "Brand", name: product.vendor ?? SITE_NAME },
  offers: productOffers(product),
});

export const collectionJsonLd = (
  name: string,
  description: string,
  path: string,
  products: Product[],
): JsonLdNode => ({
  "@context": CONTEXT,
  "@type": "CollectionPage",
  name,
  description,
  url: absoluteUrl(path),
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListElement: products.map((product: Product, index: number): JsonLdNode => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(product.href),
      name: product.name,
      image: product.image ? absoluteUrl(product.image) : undefined,
    })),
  },
});

export const faqJsonLd = (faqs: PublicFaq[]): JsonLdNode => ({
  "@context": CONTEXT,
  "@type": "FAQPage",
  mainEntity: faqs.map((faq: PublicFaq): JsonLdNode => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
});

export const blogPostJsonLd = (post: PublicBlog): JsonLdNode => ({
  "@context": CONTEXT,
  "@type": "BlogPosting",
  headline: post.title,
  description: post.seoDescription ?? post.excerpt,
  url: absoluteUrl(`/blog/${post.slug}`),
  image: post.coverImage ? absoluteUrl(post.coverImage) : undefined,
  datePublished: post.publishedAt ?? undefined,
  dateModified: post.updatedAt,
  publisher: { "@id": `${SITE_URL}/#organization` },
  mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
});

export const siteJsonLd =(): JsonLdNode[] => [
  {
    "@context": CONTEXT,
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: absoluteUrl(LOGO_PATH),
    image: absoluteUrl(LOGO_PATH),
    sameAs: [INSTAGRAM_URL],
  },
  {
    "@context": CONTEXT,
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/product?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
];
