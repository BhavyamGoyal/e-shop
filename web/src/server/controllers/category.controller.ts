import { revalidatePath } from "next/cache";
import { requireAdmin, requireStaff } from "../auth/guard";
import { NotFoundError, ValidationError } from "../http/errors";
import { categoryRepository, type StoredCategory } from "../repositories/category.repository";
import type { CategoryFields, CategoryPatch, CategoryRecord } from "../types/admin.types";

const toRecord = (category: StoredCategory, counts: Record<string, number>): CategoryRecord => ({
  id: category._id.toString(),
  name: category.name,
  slug: category.slug,
  image: category.image ?? "",
  icon: category.icon ?? "",
  description: category.description ?? "",
  position: category.position ?? 0,
  showOnHome: category.showOnHome ?? false,
  active: category.active ?? true,
  productCount: counts[category.slug] ?? 0,
});

function parsePatch(body: Record<string, unknown>): CategoryPatch {
  const patch: CategoryPatch = {};
  (["image", "icon", "description"] as const).forEach((key): void => {
    if (typeof body[key] === "string") patch[key] = (body[key] as string).trim();
  });
  (["showOnHome", "active"] as const).forEach((key): void => {
    if (typeof body[key] === "boolean") patch[key] = body[key] as boolean;
  });
  if (body.position !== undefined) {
    const position: number = Number(body.position);
    if (!Number.isFinite(position)) throw new ValidationError("Position must be a number");
    patch.position = position;
  }
  if (body.name !== undefined) {
    const name: string = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) throw new ValidationError("Category name is required");
    patch.name = name;
  }
  return patch;
}

export const categoryController = {
  async list(): Promise<CategoryRecord[]> {
    await requireStaff();
    const [categories, counts] = await Promise.all([categoryRepository.list(), categoryRepository.countBySlug()]);
    return categories.map((category: StoredCategory): CategoryRecord => toRecord(category, counts));
  },

  async update(id: string, payload: unknown): Promise<void> {
    await requireAdmin();
    if (!(await categoryRepository.findById(id))) throw new NotFoundError("Category not found");
    const patch: CategoryPatch = parsePatch((payload ?? {}) as Record<string, unknown>);
    if (Object.keys(patch).length) await categoryRepository.updateFields(id, patch as Partial<CategoryFields> & { name?: string });
    revalidatePath("/", "layout");
  },
};
