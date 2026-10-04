"use client";

import { useEffect, useState } from "react";
import type { QueryRecord } from "@/server/types/contact.types";
import { fetchQueries } from "./admin-api";

export interface QueriesController {
  queries: QueryRecord[];
  loading: boolean;
  error: string | null;
}

export function useQueries(): QueriesController {
  const [queries, setQueries] = useState<QueryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchQueries()
      .then((result: QueryRecord[]): void => {
        if (active) setQueries(result);
      })
      .catch((reason: unknown): void => {
        if (active) setError(reason instanceof Error ? reason.message : "Request failed");
      })
      .finally((): void => {
        if (active) setLoading(false);
      });
    return (): void => {
      active = false;
    };
  }, []);

  return { queries, loading, error };
}
