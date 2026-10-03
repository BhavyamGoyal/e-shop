"use client";

import { useCallback, useEffect, useState } from "react";
import type { FaqInput, FaqListData } from "@/server/types/content.types";
import { deleteFaq, fetchFaqs, saveFaq } from "./admin-api";

export interface FaqsController {
  data: FaqListData;
  loading: boolean;
  error: string | null;
  save: (id: string | null, input: FaqInput) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
}

const EMPTY: FaqListData = { faqs: [], blogs: [] };

const message = (error: unknown): string => (error instanceof Error ? error.message : "Request failed");

export function useFaqs(): FaqsController {
  const [data, setData] = useState<FaqListData>(EMPTY);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    let active = true;
    fetchFaqs()
      .then((result: FaqListData): void => {
        if (!active) return;
        setData(result);
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

  const save = useCallback((id: string | null, input: FaqInput): Promise<boolean> => mutate(() => saveFaq(id, input)), [mutate]);
  const remove = useCallback(
    async (id: string): Promise<void> => {
      await mutate(() => deleteFaq(id));
    },
    [mutate],
  );

  return { data, loading, error, save, remove };
}
