import type { ParamDefinition } from "@/customizers/core";
import type { StoredCustomizer } from "../repositories/customizer.repository";
import type { CustomizerRecord } from "../types/customizer.types";

export function toCustomizerRecord(doc: StoredCustomizer): CustomizerRecord {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    renderer: doc.renderer,
    params: (doc.params ?? []) as ParamDefinition[],
    active: doc.active ?? true,
    version: doc.version ?? 1,
  };
}
