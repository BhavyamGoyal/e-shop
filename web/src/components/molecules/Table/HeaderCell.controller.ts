"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

const SEARCH_DEBOUNCE_MS = 350;

export interface HeaderSearchHandlers {
  searchOpen: boolean;
  searchActive: boolean;
  draft: string;
  openSearch: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}

export function useHeaderSearch(
  columnKey: string,
  filterText: string,
  onFilterChange?: (columnKey: string, value: string) => void,
): HeaderSearchHandlers {
  const [searchOpen, setSearchOpen] = useState<boolean>(filterText !== "");
  const [draft, setDraft] = useState<string>(filterText);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prevFilterText, setPrevFilterText] = useState<string>(filterText);
  if (filterText !== prevFilterText) {
    setPrevFilterText(filterText);
    setDraft(filterText);
    if (filterText !== "") setSearchOpen(true);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const commitNow = (value: string): void => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onFilterChange?.(columnKey, value);
  };

  const commitSoon = (value: string): void => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onFilterChange?.(columnKey, value), SEARCH_DEBOUNCE_MS);
  };

  return {
    searchOpen,
    searchActive: searchOpen || draft.trim() !== "",
    draft,
    openSearch: () => setSearchOpen(true),
    onChange: (event) => {
      const value = event.target.value;
      setDraft(value);
      if (value === "") {
        commitNow("");
        setSearchOpen(false);
      } else {
        commitSoon(value);
      }
    },
    onKeyDown: (event) => {
      if (event.key !== "Escape") return;
      setDraft("");
      commitNow("");
      setSearchOpen(false);
    },
    onBlur: () => {
      if (draft.trim() === "") setSearchOpen(false);
    },
  };
}
