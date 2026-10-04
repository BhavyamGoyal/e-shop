import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireStaff } from "../auth/guard";
import { NotFoundError, ValidationError } from "../http/errors";
import { blogRepository, type StoredBlog } from "../repositories/blog.repository";
import { faqRepository, type StoredFaq } from "../repositories/faq.repository";
import type { FaqInput, FaqListData, FaqRecord, PublicFaq } from "../types/content.types";

async function parseInput(payload: unknown): Promise<FaqInput> {
  const raw = (payload ?? {}) as Record<string, unknown>;
  const question: string = typeof raw.question === "string" ? raw.question.trim() : "";
  const answer: string = typeof raw.answer === "string" ? raw.answer.trim() : "";
  if (!question) throw new ValidationError("Question is required");
  if (!answer) throw new ValidationError("Answer is required");
  const blogId: string | null = typeof raw.blogId === "string" && raw.blogId ? raw.blogId : null;
  if (blogId && (!isValidObjectId(blogId) || !(await blogRepository.findById(blogId)))) {
    throw new ValidationError("Linked blog post does not exist");
  }
  const position: number = Number(raw.position);
  return {
    question,
    answer,
    blogId,
    position: Number.isFinite(position) ? Math.trunc(position) : 0,
    published: raw.published !== false,
    showOnHome: raw.showOnHome === true,
  };
}

const toPublic = (faq: StoredFaq): PublicFaq => ({ id: faq._id.toString(), question: faq.question, answer: faq.answer });

const refreshStorefront = (): void => revalidatePath("/", "layout");

async function assertExists(id: string): Promise<void> {
  if (!isValidObjectId(id) || !(await faqRepository.exists(id))) throw new NotFoundError("FAQ not found");
}

export const faqController = {
  async list(): Promise<FaqListData> {
    await requireStaff();
    const [faqs, blogs] = await Promise.all([faqRepository.list(), blogRepository.list()]);
    const titles: Map<string, string> = new Map(
      blogs.map((blog: StoredBlog): [string, string] => [blog._id.toString(), blog.title]),
    );
    return {
      faqs: faqs.map((faq: StoredFaq): FaqRecord => {
        const blogId: string | null = faq.blogId ? faq.blogId.toString() : null;
        return {
          id: faq._id.toString(),
          question: faq.question,
          answer: faq.answer,
          blogId,
          blogTitle: blogId ? (titles.get(blogId) ?? null) : null,
          position: faq.position ?? 0,
          published: faq.published ?? true,
          showOnHome: faq.showOnHome ?? false,
        };
      }),
      blogs: blogs.map((blog: StoredBlog) => ({ id: blog._id.toString(), title: blog.title })),
    };
  },

  async create(payload: unknown): Promise<void> {
    await requireAdmin();
    await faqRepository.create(await parseInput(payload));
    refreshStorefront();
  },

  async update(id: string, payload: unknown): Promise<void> {
    await requireAdmin();
    await assertExists(id);
    await faqRepository.update(id, await parseInput(payload));
    refreshStorefront();
  },

  async remove(id: string): Promise<void> {
    await requireAdmin();
    await assertExists(id);
    await faqRepository.remove(id);
    refreshStorefront();
  },

  async home(): Promise<PublicFaq[]> {
    return (await faqRepository.listPublishedForHome()).map(toPublic);
  },

  async general(): Promise<PublicFaq[]> {
    return (await faqRepository.listPublishedGeneral()).map(toPublic);
  },
};
