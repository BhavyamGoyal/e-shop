import { revalidatePath } from "next/cache";
import { requireAdmin } from "../auth/guard";
import { NotFoundError, ValidationError } from "../http/errors";
import { tagRepository, type StoredTag } from "../repositories/tag.repository";
import type { TagRecord } from "../types/admin.types";

const toRecord = (tag: StoredTag, counts: Record<string, number>): TagRecord => ({
  id: tag._id.toString(),
  name: tag.name,
  productCount: counts[tag.name] ?? 0,
});

function parseName(payload: unknown): string {
  const value: unknown = (payload as { name?: unknown } | null)?.name;
  const name: string = typeof value === "string" ? value.trim() : "";
  if (!name) throw new ValidationError("Tag name is required");
  return name;
}

const refreshStorefront = (): void => revalidatePath("/", "layout");

export const tagController = {
  async list(): Promise<TagRecord[]> {
    await requireAdmin();
    await tagRepository.syncFromProducts();
    const [tags, counts] = await Promise.all([tagRepository.list(), tagRepository.countByTag()]);
    return tags.map((tag: StoredTag): TagRecord => toRecord(tag, counts));
  },

  async create(payload: unknown): Promise<TagRecord> {
    await requireAdmin();
    const name: string = parseName(payload);
    if (await tagRepository.findByName(name)) throw new ValidationError(`Tag "${name}" already exists`);
    return toRecord(await tagRepository.create(name), {});
  },

  async rename(id: string, payload: unknown): Promise<void> {
    await requireAdmin();
    const name: string = parseName(payload);
    const tag: StoredTag | null = await tagRepository.findById(id);
    if (!tag) throw new NotFoundError("Tag not found");
    const clash: StoredTag | null = await tagRepository.findByName(name);
    if (clash && clash._id.toString() !== id) throw new ValidationError(`Tag "${name}" already exists`);
    if (tag.name === name) return;
    await tagRepository.rename(id, tag.name, name);
    refreshStorefront();
  },

  async remove(id: string): Promise<void> {
    await requireAdmin();
    const tag: StoredTag | null = await tagRepository.findById(id);
    if (!tag) throw new NotFoundError("Tag not found");
    await tagRepository.remove(id, tag.name);
    refreshStorefront();
  },

  async setProductTags(productId: string, tags: string[]): Promise<void> {
    await requireAdmin();
    const known: string[] = await tagRepository.existingNames([...new Set(tags)]);
    if (!(await tagRepository.setProductTags(productId, known))) throw new NotFoundError("Product not found");
    refreshStorefront();
  },
};
