"use client";

import { useCallback, useEffect, useState } from "react";
import type { ImportFormat, ImportResult, InsightKind, InstagramDashboard } from "@/server/types/instagram.types";
import { fetchInstagram, importInstagram, syncInstagram } from "./instagram-api";

export interface InstagramController {
  data: InstagramDashboard | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  notice: string | null;
  upload: (kind: InsightKind, file: File) => Promise<void>;
  sync: () => Promise<void>;
}

const formatOf = (file: File): ImportFormat => (file.name.toLowerCase().endsWith(".json") ? "json" : "csv");

export function useInstagram(): InstagramController {
  const [data, setData] = useState<InstagramDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchInstagram()
      .then((result: InstagramDashboard): void => {
        if (active) setData(result);
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

  const run = useCallback(
    async (task: () => Promise<ImportResult>): Promise<void> => {
      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        const result: ImportResult = await task();
        setData(await fetchInstagram());
        setNotice(`${result.imported} records saved`);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Request failed");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const upload = useCallback(
    async (kind: InsightKind, file: File): Promise<void> => {
      const content: string = await file.text();
      await run((): Promise<ImportResult> => importInstagram({ kind, format: formatOf(file), content }));
    },
    [run],
  );

  const sync = useCallback((): Promise<void> => run(syncInstagram), [run]);

  return { data, loading, busy, error, notice, upload, sync };
}
