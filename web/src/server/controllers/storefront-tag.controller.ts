import { tagRepository, type StoredTag } from "../repositories/tag.repository";
import type { StorefrontTag, StorefrontTags } from "../types/product.types";

const toStorefront = (tag: StoredTag, counts: Record<string, number>): StorefrontTag => ({
  name: tag.name,
  href: `/products/${encodeURIComponent(tag.name)}`,
  icon: tag.icon ?? "",
  image: tag.image ?? "",
  count: counts[tag.name] ?? 0,
});

export const storefrontTagController = {
  async names(): Promise<string[]> {
    const counts: Record<string, number> = await tagRepository.countByTag();
    return Object.keys(counts).filter((name: string): boolean => counts[name] > 0);
  },

  async exists(name: string): Promise<boolean> {
    const counts: Record<string, number> = await tagRepository.countByTag();
    return (counts[name] ?? 0) > 0;
  },

  async flagged(): Promise<StorefrontTags> {
    const [tags, counts] = await Promise.all([tagRepository.listFlagged(), tagRepository.countByTag()]);
    return {
      header: tags.filter((tag: StoredTag): boolean => tag.header === true).map((tag: StoredTag) => toStorefront(tag, counts)),
      collection: tags
        .filter((tag: StoredTag): boolean => tag.collection === true)
        .map((tag: StoredTag) => toStorefront(tag, counts)),
    };
  },
};
