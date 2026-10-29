"use client";

import { useRouter } from "next/router";
import { useState, type FocusEvent, type FormEvent, type KeyboardEvent, type MouseEvent } from "react";
import { formatPrice } from "@/lib/format-price";
import { useSearchSuggestions } from "@/lib/use-search-suggestions";
import type { ProductSummary } from "@/server/types/product.types";

export interface SearchBoxProps {
  icon: string;
  placeholder: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
}

const resultsHref = (term: string): string => `/product?q=${encodeURIComponent(term)}`;

export function SearchBox({ icon, placeholder, autoFocus, onNavigate }: SearchBoxProps) {
  const router = useRouter();
  const current: string = typeof router.query.q === "string" ? router.query.q : "";
  const [draft, setDraft] = useState<string | null>(null);
  const [focused, setFocused] = useState<boolean>(false);
  const value: string = draft ?? current;
  const term: string = value.trim();
  const { items: suggestions, loading } = useSearchSuggestions(value);
  const showList: boolean = focused && suggestions.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!term) return;
    setFocused(false);
    onNavigate?.();
    void router.push(resultsHref(term));
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Escape") setFocused(false);
  };

  return (
    <div className="relative w-full" onBlur={handleBlur}>
      <form role="search" onSubmit={handleSubmit} className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <img src={icon} alt="search" width={20} height={20} />
        </span>
        <input
          type="search"
          name="q"
          autoComplete="off"
          autoFocus={autoFocus}
          value={value}
          placeholder={placeholder}
          aria-label="Search products"
          onChange={(event) => setDraft(event.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          aria-busy={loading}
          className="w-full rounded-lg border border-border bg-muted py-3 pr-11 pl-11 text-sm outline-none focus:border-ring"
        />
        {loading && (
          <span
            role="status"
            aria-label="Searching"
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
          >
            <span className="size-4 animate-spin rounded-full border-2 border-border border-t-primary" />
          </span>
        )}
      </form>
      {showList && (
        <ul
          onMouseDown={(event: MouseEvent<HTMLUListElement>): void => event.preventDefault()}
          className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
        >
          {suggestions.map((item: ProductSummary) => (
            <li key={item.handle}>
              <a href={`/product/${item.handle}`} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted">
                {item.image && (
                  <img src={item.image} alt="" width={40} height={40} className="size-10 rounded object-cover" />
                )}
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                <span className="shrink-0 text-muted-foreground">{formatPrice(item.price)}</span>
              </a>
            </li>
          ))}
          <li>
            <a
              href={resultsHref(term)}
              className="block border-t border-border px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
            >
              See all results for “{term}”
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}
