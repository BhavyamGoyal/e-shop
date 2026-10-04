import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { blogController } from "@/server/controllers/blog.controller";
import { collectionController } from "@/server/controllers/collection.controller";
import type { BlogSitemapEntry } from "@/server/types/content.types";
import { productController } from "@/server/controllers/product.controller";
import type { ProductSitemapEntry } from "@/server/repositories/product.repository";
import type { CollectionSummary } from "@/server/types/product.types";

export const revalidate = 172800;

type Entry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [collections, products, posts]: [CollectionSummary[], ProductSitemapEntry[], BlogSitemapEntry[]] = await Promise.all([
    collectionController.all(),
    productController.sitemapEntries(),
    blogController.sitemapEntries(),
  ]);
  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/product"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/faq"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/refund-policy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/shipping-policy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.3 },
    ...posts.map(
      (post: BlogSitemapEntry): Entry => ({
        url: absoluteUrl(`/blog/${post.slug}`),
        lastModified: post.lastModified ?? undefined,
        changeFrequency: "monthly",
        priority: 0.6,
      }),
    ),
    ...collections.map(
      (collection: CollectionSummary): Entry => ({
        url: absoluteUrl(`/${collection.handle}`),
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    ),
    ...products.map(
      (product: ProductSitemapEntry): Entry => ({
        url: absoluteUrl(`/product/${product.handle}`),
        lastModified: product.lastModified ?? undefined,
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    ),
  ];
}
