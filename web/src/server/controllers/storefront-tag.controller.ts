import { tagRepository, type StoredTag } from "../repositories/tag.repository";
import type { StorefrontTag, StorefrontTags } from "../types/product.types";

const toStorefront = (tag: StoredTag, counts: Record<string, number>): StorefrontTag => ({
  name: tag.name,
  href: `/product?tag=${encodeURIComponent(tag.name)}`,
  icon: tag.icon ?? "",
  image: tag.image ?? "",
  count: counts[tag.name] ?? 0,
});

export const storefrontTagController = {
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
