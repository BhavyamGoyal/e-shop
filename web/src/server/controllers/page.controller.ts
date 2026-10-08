import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { markdownTitle } from "@/lib/markdown-meta";
import { RESERVED_HANDLES } from "@/lib/site";
import { requireAdmin, requireStaff } from "../auth/guard";
import { NotFoundError, ValidationError } from "../http/errors";
import { pageRepository, type StoredPage } from "../repositories/page.repository";
import type { PageEditorData, PageInput, PageRecord, PageSitemapEntry } from "../types/content.types";
import { slugify } from "./blog.controller";

function parseInput(payload: unknown): PageInput {
  const raw = (payload ?? {}) as Record<string, unknown>;
  const url: string = slugify(typeof raw.url === "string" ? raw.url.replace(/^\/+/, "") : "");
  const content: string = typeof raw.content === "string" ? raw.content : "";
  if (!url) throw new ValidationError("URL is required");
  if (RESERVED_HANDLES.includes(url)) throw new ValidationError(`"${url}" is reserved for the site`);
  if (!content.trim()) throw new ValidationError("Content is required");
  return { url, content };
}

const toRecord = (page: StoredPage): PageRecord => ({
  id: page._id.toString(),
  url: page.url,
  content: page.content,
  title: markdownTitle(page.content, page.url),
  updatedAt: page.updatedAt.toISOString(),
});

const refreshStorefront = (): void => revalidatePath("/", "layout");

async function assertExists(id: string): Promise<void> {
  if (!isValidObjectId(id) || !(await pageRepository.exists(id))) throw new NotFoundError("Page not found");
}

async function assertUrlFree(url: string, ownId: string | null): Promise<void> {
  const holder: string | null = await pageRepository.findIdByUrl(url);
  if (holder && holder !== ownId) throw new ValidationError(`A page already uses /${url}`);
}

export const pageController = {
  async list(): Promise<PageRecord[]> {
    await requireStaff();
    return (await pageRepository.list()).map(toRecord);
  },

  async editor(id: string | null): Promise<PageEditorData> {
    await requireStaff();
    if (!id) return { id: null, input: { url: "", content: "" } };
    const page: StoredPage | null = isValidObjectId(id) ? await pageRepository.findById(id) : null;
    if (!page) throw new NotFoundError("Page not found");
    return { id, input: { url: page.url, content: page.content } };
  },

  async create(payload: unknown): Promise<void> {
    await requireAdmin();
    const input: PageInput = parseInput(payload);
    await assertUrlFree(input.url, null);
    await pageRepository.create(input);
    refreshStorefront();
  },

  async update(id: string, payload: unknown): Promise<void> {
    await requireAdmin();
    await assertExists(id);
    const input: PageInput = parseInput(payload);
    await assertUrlFree(input.url, id);
    await pageRepository.update(id, input);
    refreshStorefront();
  },

  async remove(id: string): Promise<void> {
    await requireAdmin();
    await assertExists(id);
    await pageRepository.remove(id);
    refreshStorefront();
  },

  async sitemapEntries(): Promise<PageSitemapEntry[]> {
    return (await pageRepository.list()).map(
      (page: StoredPage): PageSitemapEntry => ({ url: page.url, lastModified: page.updatedAt }),
    );
  },
};
