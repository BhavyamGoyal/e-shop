import { isValidObjectId } from "mongoose";
import { requireAdmin, requireStaff } from "../auth/guard";
import { NotFoundError, ValidationError } from "../http/errors";
import { toCustomizerRecord } from "../mappers/customizer.mapper";
import { customizerRepository, type StoredCustomizer } from "../repositories/customizer.repository";
import { customizerService } from "../services/customizer.service";
import type { CartCustomization } from "@/customizers/core";
import type { CustomizerInput, CustomizerRecord } from "../types/customizer.types";
import { parseCustomizerInput } from "../validators/customizer-input";

async function assertExists(id: string): Promise<StoredCustomizer> {
  const stored: StoredCustomizer | null = isValidObjectId(id) ? await customizerRepository.findById(id) : null;
  if (!stored) throw new NotFoundError("Customizer not found");
  return stored;
}

async function assertSlugFree(slug: string, ownerId: string | null): Promise<void> {
  const existing: StoredCustomizer | null = await customizerRepository.findBySlug(slug);
  if (existing && existing._id.toString() !== ownerId) throw new ValidationError("Slug is already used");
}

export const customizerController = {
  async list(): Promise<CustomizerRecord[]> {
    await requireStaff();
    return (await customizerRepository.list()).map(toCustomizerRecord);
  },

  async findActive(slug: string): Promise<CustomizerRecord> {
    const config: CustomizerRecord | null = await customizerService.findActive(slug);
    if (!config) throw new NotFoundError("Customizer not found");
    return config;
  },

  resolve(slug: string, payload: unknown): Promise<CartCustomization> {
    const params: unknown = ((payload ?? {}) as Record<string, unknown>).params;
    return customizerService.resolve(slug, params);
  },

  async create(payload: unknown): Promise<void> {
    await requireAdmin();
    const input: CustomizerInput = parseCustomizerInput(payload);
    await assertSlugFree(input.slug, null);
    await customizerRepository.create(input);
  },

  async update(id: string, payload: unknown): Promise<void> {
    await requireAdmin();
    const current: StoredCustomizer = await assertExists(id);
    const input: CustomizerInput = parseCustomizerInput(payload);
    await assertSlugFree(input.slug, id);
    if (input.slug !== current.slug && (await customizerRepository.countProductsUsing(current.slug)) > 0) {
      throw new ValidationError("Slug cannot change while products use this customizer");
    }
    await customizerRepository.update(id, input);
  },

  async remove(id: string): Promise<void> {
    await requireAdmin();
    const current: StoredCustomizer = await assertExists(id);
    if ((await customizerRepository.countProductsUsing(current.slug)) > 0) {
      throw new ValidationError("Products still use this customizer");
    }
    await customizerRepository.remove(id);
  },
};
