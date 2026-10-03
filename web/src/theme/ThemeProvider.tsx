"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { themes } from "./registry";
import { themeStore, type ThemeStore } from "./themeStore";
import type { Theme } from "./types";

interface ThemeContextValue {
  theme: Theme;
  themes: readonly Theme[];
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  store?: ThemeStore;
}

export function ThemeProvider({ children, store = themeStore }: ThemeProviderProps) {
  const themeId = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  useEffect(() => {
    store.apply(themeId);
  }, [store, themeId]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: themes.find((item) => item.id === themeId) ?? themes[0],
      themes,
      setTheme: (id) => store.set(id),
    }),
    [store, themeId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
