"use client";

import { useCallback, useEffect, useState } from "react";
import type { BlogRow } from "@/server/types/content.types";
import { deleteBlog, fetchBlogs } from "./admin-api";

export interface BlogsController {
  blogs: BlogRow[];
  loading: boolean;
  error: string | null;
  remove: (id: string) => Promise<void>;
}

const message = (error: unknown): string => (error instanceof Error ? error.message : "Request failed");

export function useBlogs(): BlogsController {
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    let active = true;
    fetchBlogs()
      .then((result: BlogRow[]): void => {
        if (!active) return;
        setBlogs(result);
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

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteBlog(id);
      setVersion((value: number): number => value + 1);
    } catch (reason: unknown) {
      setError(message(reason));
    }
  }, []);

  return { blogs, loading, error, remove };
}
