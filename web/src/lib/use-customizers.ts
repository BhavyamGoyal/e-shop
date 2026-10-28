"use client";

import { useCallback, useEffect, useState } from "react";
import type { CustomizerInput, CustomizerRecord } from "@/server/types/customizer.types";
import { deleteCustomizer, fetchCustomizers, saveCustomizer } from "./customizer-api";

export interface CustomizersController {
  data: CustomizerRecord[];
  loading: boolean;
  error: string | null;
  save: (id: string | null, input: CustomizerInput) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
}

const message = (error: unknown): string => (error instanceof Error ? error.message : "Request failed");

export function useCustomizers(): CustomizersController {
  const [data, setData] = useState<CustomizerRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    let active = true;
    fetchCustomizers()
      .then((result: CustomizerRecord[]): void => {
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

  const save = useCallback(
    (id: string | null, input: CustomizerInput): Promise<boolean> => mutate(() => saveCustomizer(id, input)),
    [mutate],
  );
  const remove = useCallback(
    async (id: string): Promise<void> => {
      await mutate(() => deleteCustomizer(id));
    },
    [mutate],
  );

  return { data, loading, error, save, remove };
}
