"use server";

import { ApiError } from "../http/errors";
import { tagController } from "../controllers/tag.controller";
import { productAdminController } from "../controllers/product-admin.controller";
import type { ActionResult } from "../types/admin.types";

async function run(action: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await action();
  } catch (error: unknown) {
    if (error instanceof ApiError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Something went wrong" };
  }
}

export async function saveProductAction(id: string | null, payload: unknown): Promise<ActionResult> {
  return run(async (): Promise<ActionResult> => {
    const saved = await productAdminController.save(id, payload);
    return { ok: true, id: saved.id, handle: saved.handle };
  });
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  return run(async (): Promise<ActionResult> => {
    await productAdminController.remove(id);
    return { ok: true };
  });
}

export async function setProductTagsAction(id: string, tags: string[]): Promise<ActionResult> {
  return run(async (): Promise<ActionResult> => {
    await tagController.setProductTags(id, tags);
    return { ok: true };
  });
}
