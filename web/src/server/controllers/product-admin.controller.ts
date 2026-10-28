import { revalidatePath } from "next/cache";
import { requireAdmin, requireStaff } from "../auth/guard";
import { NotFoundError, ValidationError } from "../http/errors";
import {
  EMPTY_INPUT,
  toDocumentFields,
  toInput,
  toListRow,
} from "../mappers/product-input.mapper";
import {
  productAdminRepository,
  type AdminProduct,
  type AdminProductPage,
} from "../repositories/product-admin.repository";
import type { ProductEditorData, ProductInput, ProductListPage, ProductListQuery } from "../types/admin.types";
import { revalidatePages } from "../services/pages-revalidate.service";
import { customizerRepository } from "../repositories/customizer.repository";
import { tagRepository } from "../repositories/tag.repository";
import { parseProductInput } from "../validators/product-input";

export interface SavedProduct {
  id: string;
  handle: string;
}

async function revalidateStorefront(handle: string, previousHandle?: string): Promise<void> {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  const pages: string[] = ["/", "/product", `/product/${handle}`];
  if (previousHandle && previousHandle !== handle) pages.push(`/product/${previousHandle}`);
  await revalidatePages(pages);
}

export const productAdminController = {
  async list(query: ProductListQuery): Promise<ProductListPage> {
    await requireStaff();
    const { items, total }: AdminProductPage = await productAdminRepository.list(query);
    return {
      data: items.map(toListRow),
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.max(1, Math.ceil(total / query.limit)) },
    };
  },

  async editor(id: string | null): Promise<ProductEditorData> {
    await requireStaff();
    if (!id) return { id: null, input: EMPTY_INPUT };
    const doc: AdminProduct | null = await productAdminRepository.findById(id);
    if (!doc) throw new NotFoundError("Product not found");
    return { id, input: toInput(doc) };
  },

  async save(id: string | null, payload: unknown): Promise<SavedProduct> {
    await requireAdmin();
    const input: ProductInput = parseProductInput(payload);
    if (await productAdminRepository.handleTaken(input.handle, id)) {
      throw new ValidationError(`Handle "${input.handle}" is already used by another product`);
    }
    if (input.customizerSlug && !(await customizerRepository.slugExists(input.customizerSlug))) {
      throw new ValidationError(`Customizer "${input.customizerSlug}" does not exist`);
    }
    const fields: Record<string, unknown> = toDocumentFields({
      ...input,
      tags: await tagRepository.existingNames(input.tags),
    });
    if (!id) {
      const created: AdminProduct = await productAdminRepository.create(fields);
      await revalidateStorefront(created.handle);
      return { id: created._id.toString(), handle: created.handle };
    }
    const previous: AdminProduct | null = await productAdminRepository.findById(id);
    const updated: AdminProduct | null = await productAdminRepository.update(id, fields);
    if (!updated) throw new NotFoundError("Product not found");
    await revalidateStorefront(updated.handle, previous?.handle);
    return { id, handle: updated.handle };
  },

  async setActive(id: string, active: boolean): Promise<void> {
    await requireStaff();
    const updated: AdminProduct | null = await productAdminRepository.update(id, { active });
    if (!updated) throw new NotFoundError("Product not found");
    await revalidateStorefront(updated.handle);
  },

  async remove(id: string): Promise<void> {
    await requireAdmin();
    const removed: AdminProduct | null = await productAdminRepository.remove(id);
    if (!removed) throw new NotFoundError("Product not found");
    await revalidateStorefront(removed.handle);
  },
};
