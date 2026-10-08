import { markdownDescription, markdownTitle } from "@/lib/markdown-meta";
import { pageRepository, type StoredPage } from "../repositories/page.repository";
import type { PublicPage } from "../types/content.types";

const toPublic = (page: StoredPage): PublicPage => ({
  url: page.url,
  content: page.content,
  title: markdownTitle(page.content, page.url),
  description: markdownDescription(page.content),
  updatedAt: page.updatedAt.toISOString(),
});

export const storefrontPages = {
  async findByUrl(url: string): Promise<PublicPage | null> {
    const page: StoredPage | null = await pageRepository.findByUrl(url);
    return page ? toPublic(page) : null;
  },

  async urls(): Promise<string[]> {
    return (await pageRepository.list()).map((page: StoredPage): string => page.url);
  },
};
