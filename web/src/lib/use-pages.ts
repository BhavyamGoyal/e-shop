"use client";

import { useCallback, useEffect, useState } from "react";
import type { PageRecord } from "@/server/types/content.types";
import { deletePage, fetchPages } from "./admin-api";

export interface PagesController {
  pages: PageRecord[];
  loading: boolean;
  error: string | null;
  remove: (id: string) => Promise<void>;
}

const message = (error: unknown): string => (error instanceof Error ? error.message : "Request failed");

export function usePages(): PagesController {
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    let active = true;
    fetchPages()
      .then((result: PageRecord[]): void => {
        if (!active) return;
        setPages(result);
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

  const remove = useCallback(
    async (id: string): Promise<void> => {
      await mutate(() => deletePage(id));
    },
    [mutate],
  );

  return { pages, loading, error, remove };
}
