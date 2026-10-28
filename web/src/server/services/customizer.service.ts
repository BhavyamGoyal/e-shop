import { paramResolver, type CartCustomization } from "@/customizers/core";
import { QueryError } from "../http/errors";
import { toCustomizerRecord } from "../mappers/customizer.mapper";
import { customizerRepository, type StoredCustomizer } from "../repositories/customizer.repository";
import type { CustomizerRecord } from "../types/customizer.types";

const UNAVAILABLE = "This customizer is not available";

export const customizerService = {
  async findActive(slug: string): Promise<CustomizerRecord | null> {
    const stored: StoredCustomizer | null = await customizerRepository.findBySlug(slug);
    return stored && stored.active !== false ? toCustomizerRecord(stored) : null;
  },

  async resolve(slug: string, input: unknown): Promise<CartCustomization> {
    const config: CustomizerRecord | null = await this.findActive(slug);
    if (!config) throw new QueryError(UNAVAILABLE);
    return {
      slug: config.slug,
      renderer: config.renderer,
      version: config.version,
      params: paramResolver.resolve(config.params, input),
    };
  },
};
