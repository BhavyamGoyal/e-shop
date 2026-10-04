import { revalidatePath } from "next/cache";
import { requireAdmin, requireStaff } from "../auth/guard";
import { NotFoundError, ValidationError } from "../http/errors";
import { blogRepository, type StoredBlog } from "../repositories/blog.repository";
import { faqRepository, type StoredFaq } from "../repositories/faq.repository";
import type {
  BlogEditorData,
  BlogInput,
  BlogRow,
  BlogSitemapEntry,
  PublicBlog,
  PublicBlogSummary,
  PublicFaq,
} from "../types/content.types";

const EMPTY_INPUT: BlogInput = {
  title: "",
  slug: "",
  excerpt: "",
  bodyHtml: "",
  coverImage: "",
  published: false,
  seoTitle: "",
  seoDescription: "",
};

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function parseInput(payload: unknown): BlogInput {
  const raw = (payload ?? {}) as Record<string, unknown>;
  const title: string = text(raw.title);
  if (!title) throw new ValidationError("Title is required");
  const slug: string = slugify(text(raw.slug) || title);
  if (!slug) throw new ValidationError("Slug could not be generated from the title");
  return {
    title,
    slug,
    excerpt: text(raw.excerpt),
    bodyHtml: typeof raw.bodyHtml === "string" ? raw.bodyHtml : "",
    coverImage: text(raw.coverImage),
    published: raw.published === true,
    seoTitle: text(raw.seoTitle),
    seoDescription: text(raw.seoDescription),
  };
}

const toInput = (blog: StoredBlog): BlogInput => ({
  title: blog.title,
  slug: blog.slug,
  excerpt: blog.excerpt ?? "",
  bodyHtml: blog.bodyHtml ?? "",
  coverImage: blog.coverImage ?? "",
  published: blog.published ?? false,
  seoTitle: blog.seoTitle ?? "",
  seoDescription: blog.seoDescription ?? "",
});

const toIso = (date: Date | null | undefined): string | null => (date ? new Date(date).toISOString() : null);

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

const resolvePublishedAt = (published: boolean, existing: Date | null | undefined): Date | null =>
  published ? (existing ?? new Date()) : null;

const refreshStorefront = (): void => revalidatePath("/", "layout");

async function assertSlugFree(slug: string, ownId: string | null): Promise<void> {
  const clash: StoredBlog | null = await blogRepository.findBySlug(slug);
  if (clash && clash._id.toString() !== ownId) throw new ValidationError(`Slug "${slug}" is already used by another post`);
}

export const blogController = {
  async adminList(): Promise<BlogRow[]> {
    await requireStaff();
    const [blogs, counts] = await Promise.all([blogRepository.list(), faqRepository.countByBlog()]);
    return blogs.map(
      (blog: StoredBlog): BlogRow => ({
        id: blog._id.toString(),
        title: blog.title,
        slug: blog.slug,
        published: blog.published ?? false,
        publishedAt: toIso(blog.publishedAt),
        updatedAt: new Date(blog.updatedAt).toISOString(),
        faqCount: counts[blog._id.toString()] ?? 0,
      }),
    );
  },

  async editor(id: string | null): Promise<BlogEditorData> {
    await requireStaff();
    if (!id) return { id: null, input: EMPTY_INPUT };
    const blog: StoredBlog | null = await blogRepository.findById(id);
    if (!blog) throw new NotFoundError("Blog post not found");
    return { id, input: toInput(blog) };
  },

  async create(payload: unknown): Promise<{ id: string; slug: string }> {
    await requireAdmin();
    const input: BlogInput = parseInput(payload);
    await assertSlugFree(input.slug, null);
    const created: StoredBlog = await blogRepository.create(input, resolvePublishedAt(input.published, null));
    refreshStorefront();
    return { id: created._id.toString(), slug: created.slug };
  },

  async update(id: string, payload: unknown): Promise<{ id: string; slug: string }> {
    await requireAdmin();
    const input: BlogInput = parseInput(payload);
    const existing: StoredBlog | null = await blogRepository.findById(id);
    if (!existing) throw new NotFoundError("Blog post not found");
    await assertSlugFree(input.slug, id);
    await blogRepository.update(id, input, resolvePublishedAt(input.published, existing.publishedAt));
    refreshStorefront();
    return { id, slug: input.slug };
  },

  async remove(id: string): Promise<void> {
    await requireAdmin();
    if (!(await blogRepository.findById(id))) throw new NotFoundError("Blog post not found");
    await blogRepository.remove(id);
    refreshStorefront();
  },

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
