import { revalidatePath } from "next/cache";
import { requireAdmin, requireStaff } from "../auth/guard";
import { NotFoundError, ValidationError } from "../http/errors";
import { tagRepository, type StoredTag } from "../repositories/tag.repository";
import type { TagFields, TagPatch, TagRecord } from "../types/admin.types";

const toRecord = (tag: StoredTag, counts: Record<string, number>): TagRecord => ({
  id: tag._id.toString(),
  name: tag.name,
  icon: tag.icon ?? "",
  image: tag.image ?? "",
  header: tag.header ?? false,
  collection: tag.collection ?? false,
  productCount: counts[tag.name] ?? 0,
});

function parseName(value: unknown): string {
  const name: string = typeof value === "string" ? value.trim() : "";
  if (!name) throw new ValidationError("Tag name is required");
  return name;
}

function parseFields(body: Record<string, unknown>): Partial<TagFields> {
  const fields: Partial<TagFields> = {};
  (["icon", "image"] as const).forEach((key): void => {
    if (typeof body[key] === "string") fields[key] = (body[key] as string).trim();
  });
  (["header", "collection"] as const).forEach((key): void => {
    if (typeof body[key] === "boolean") fields[key] = body[key] as boolean;
  });
  return fields;
}

const refreshStorefront = (): void => revalidatePath("/", "layout");

export const tagController = {
  async list(): Promise<TagRecord[]> {
    await requireStaff();
    await tagRepository.syncFromProducts();
    const [tags, counts] = await Promise.all([tagRepository.list(), tagRepository.countByTag()]);
    return tags.map((tag: StoredTag): TagRecord => toRecord(tag, counts));
  },

  async create(payload: unknown): Promise<TagRecord> {
    await requireAdmin();
    const name: string = parseName((payload as { name?: unknown } | null)?.name);
    if (await tagRepository.findByName(name)) throw new ValidationError(`Tag "${name}" already exists`);
    return toRecord(await tagRepository.create(name), {});
  },

  async update(id: string, payload: unknown): Promise<void> {
    await requireAdmin();
    const body: Record<string, unknown> = (payload ?? {}) as Record<string, unknown>;
    const tag: StoredTag | null = await tagRepository.findById(id);
    if (!tag) throw new NotFoundError("Tag not found");
    if (body.name !== undefined) {
      const name: string = parseName(body.name);
      const clash: StoredTag | null = await tagRepository.findByName(name);
      if (clash && clash._id.toString() !== id) throw new ValidationError(`Tag "${name}" already exists`);
      if (tag.name !== name) await tagRepository.rename(id, tag.name, name);
    }
    const fields: Partial<TagFields> = parseFields(body);
    if (Object.keys(fields).length) await tagRepository.updateFields(id, fields);
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
