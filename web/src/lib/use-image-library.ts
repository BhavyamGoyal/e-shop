"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import type { ImageRecord } from "@/server/types/admin.types";
import { deleteImage, fetchImages, uploadImage } from "./admin-api";

export interface ImageLibrary {
  items: ImageRecord[];
  page: number;
  totalPages: number;
  total: number;
  search: string;
  busy: boolean;
  error: string | null;
  setSearch: (value: string) => void;
  setPage: (value: number) => void;
  upload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const message = (error: unknown): string => (error instanceof Error ? error.message : "Request failed");

export function useImageLibrary(): ImageLibrary {
  const [items, setItems] = useState<ImageRecord[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearchValue] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  const key = `${page}|${search}|${version}`;

  useEffect(() => {
    let active = true;
    fetchImages(page, search)
      .then((result): void => {
        if (!active) return;
        setItems(result.data);
        setTotalPages(result.meta.totalPages);
        setTotal(result.meta.total);
        setError(null);
      })
      .catch((reason: unknown): void => {
        if (active) setError(message(reason));
      })
      .finally((): void => {
        if (active) setLoaded(key);
      });
    return (): void => {
      active = false;
    };
  }, [page, search, version, key]);

  const setSearch = useCallback((value: string): void => {
    setPage(1);
    setSearchValue(value);
  }, []);

  const upload = useCallback(async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files: File[] = Array.from(event.target.files ?? []);
    event.target.value = "";
    setUploading(true);
    const failures: string[] = [];
    for (const file of files) {
      try {
        await uploadImage(file);
      } catch (reason: unknown) {
        failures.push(message(reason));
      }
    }
    setError(failures.length ? failures.join(" | ") : null);
    setUploading(false);
    setPage(1);
    setVersion((value: number): number => value + 1);
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteImage(id);
      setVersion((value: number): number => value + 1);
    } catch (reason: unknown) {
      setError(message(reason));
    }
  }, []);

  const busy: boolean = uploading || loaded !== key;

  return { items, page, totalPages, total, search, busy, error, setSearch, setPage, upload, remove };
}
