"use client";

import { useCallback, useEffect, useState } from "react";
import type { TagPatch, TagRecord } from "@/server/types/admin.types";
import { createTag, deleteTag, fetchTags, updateTag } from "./admin-api";

export interface TagsController {
  tags: TagRecord[];
  loading: boolean;
  error: string | null;
  create: (name: string) => Promise<boolean>;
  update: (id: string, patch: TagPatch) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
}

const message = (error: unknown): string => (error instanceof Error ? error.message : "Request failed");

export function useTags(): TagsController {
  const [tags, setTags] = useState<TagRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    let active = true;
    fetchTags()
      .then((result: TagRecord[]): void => {
        if (!active) return;
        setTags(result);
        setError(null);
      })
      .catch((reason: unknown): void => {
        if (active) setError(message(reason));
      })
      .finally((): void => {
        if (active) setLoading(false);
      });
    return (): void => {
      active = false;
    };
  }, [version]);

  const mutate = useCallback(async (action: () => Promise<void>): Promise<boolean> => {
    try {
      await action();
      setVersion((value: number): number => value + 1);
      return true;
    } catch (reason: unknown) {
      setError(message(reason));
      return false;
    }
  }, []);

  const create = useCallback((name: string): Promise<boolean> => mutate(() => createTag(name)), [mutate]);
  const update = useCallback((id: string, patch: TagPatch): Promise<boolean> => mutate(() => updateTag(id, patch)), [mutate]);
  const remove = useCallback(
    async (id: string): Promise<void> => {
      await mutate(() => deleteTag(id));
    },
    [mutate],
  );

  return { tags, loading, error, create, update, remove };
}
