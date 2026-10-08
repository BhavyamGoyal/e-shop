import { blogRepository, type StoredBlog } from "../repositories/blog.repository";
import { faqRepository, type StoredFaq } from "../repositories/faq.repository";
import type { BlogSitemapEntry, PublicBlog, PublicBlogSummary, PublicFaq } from "../types/content.types";

export const toIso = (date: Date | null | undefined): string | null => (date ? new Date(date).toISOString() : null);

const toSummary = (blog: StoredBlog): PublicBlogSummary => ({
  slug: blog.slug,
  title: blog.title,
  excerpt: blog.excerpt ?? "",
  coverImage: blog.coverImage || null,
  publishedAt: toIso(blog.publishedAt),
});

const toPublicFaq = (faq: StoredFaq): PublicFaq => ({
  id: faq._id.toString(),
  question: faq.question,
  answer: faq.answer,
});

export const storefrontBlogs = {
  async published(): Promise<PublicBlogSummary[]> {
    return (await blogRepository.listPublished()).map(toSummary);
  },

  async publicBySlug(slug: string): Promise<PublicBlog | null> {
    const blog: StoredBlog | null = await blogRepository.findPublishedBySlug(slug);
    if (!blog) return null;
    const faqs: StoredFaq[] = await faqRepository.listPublishedForBlog(blog._id.toString());
    return {
      ...toSummary(blog),
      bodyHtml: blog.bodyHtml ?? "",
      seoTitle: blog.seoTitle || null,
      seoDescription: blog.seoDescription || null,
      updatedAt: new Date(blog.updatedAt).toISOString(),
      faqs: faqs.map(toPublicFaq),
    };
  },

  sitemapEntries(): Promise<BlogSitemapEntry[]> {
    return blogRepository.sitemapEntries();
  },
};
