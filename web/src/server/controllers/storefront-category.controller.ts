import { categoryRepository, type StoredCategory } from "../repositories/category.repository";
import type { StorefrontCategory } from "../types/product.types";

const toStorefront = (category: StoredCategory, counts: Record<string, number>): StorefrontCategory => ({
  name: category.name,
  slug: category.slug,
  href: `/products/${encodeURIComponent(category.slug)}`,
  icon: category.icon ?? "",
  image: category.image ?? "",
  description: category.description ?? "",
  count: counts[category.slug] ?? 0,
});

export const storefrontCategoryController = {
  async slugs(): Promise<string[]> {
    const [categories, counts] = await Promise.all([categoryRepository.listActive(), categoryRepository.countBySlug()]);
    return categories.map((category: StoredCategory): string => category.slug).filter((slug: string): boolean => (counts[slug] ?? 0) > 0);
  },

  async find(slug: string): Promise<StorefrontCategory | null> {
    const [category, counts] = await Promise.all([categoryRepository.findBySlug(slug), categoryRepository.countBySlug()]);
    return category ? toStorefront(category, counts) : null;
  },

  async home(): Promise<StorefrontCategory[]> {
    const [categories, counts] = await Promise.all([categoryRepository.listActive(), categoryRepository.countBySlug()]);
    return categories
      .filter((category: StoredCategory): boolean => category.showOnHome === true && (counts[category.slug] ?? 0) > 0)
      .map((category: StoredCategory): StorefrontCategory => toStorefront(category, counts));
  },
};
