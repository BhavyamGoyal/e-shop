"use client";

import { useEffect, useState } from "react";
import type { ProductPage, ProductSummary } from "@/server/types/product.types";

interface Loaded {
  term: string;
  items: ProductSummary[];
}

const MIN_LENGTH = 2;
const DEBOUNCE_MS = 250;

export function useSearchSuggestions(input: string): ProductSummary[] {
  const term: string = input.trim();
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect((): (() => void) | void => {
    if (term.length < MIN_LENGTH) return;
    const controller: AbortController = new AbortController();
    const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
      fetch(`/api/products/suggest?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((response: Response): Promise<ProductPage> => {
          if (!response.ok) throw new Error(`Request failed with ${response.status}`);
          return response.json();
        })
        .then((page: ProductPage): void => setLoaded({ term, items: page.data }))
        .catch((): void => undefined);
    }, DEBOUNCE_MS);
    return (): void => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  return loaded?.term === term && term.length >= MIN_LENGTH ? loaded.items : [];
}
