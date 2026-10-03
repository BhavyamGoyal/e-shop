import { THEME_ATTRIBUTE } from "./css";
import { DEFAULT_THEME_ID, resolveThemeId } from "./registry";
import { browserThemeStorage, type ThemeStorage } from "./storage";

type Listener = () => void;

export interface ThemeStore {
  subscribe(listener: Listener): () => void;
  getSnapshot(): string;
  getServerSnapshot(): string;
  set(themeId: string): void;
  apply(themeId: string): void;
}

export const createThemeStore = (storage: ThemeStorage): ThemeStore => {
  const listeners = new Set<Listener>();

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => resolveThemeId(storage.read()),
    getServerSnapshot: () => DEFAULT_THEME_ID,
    apply(themeId) {
      document.documentElement.setAttribute(THEME_ATTRIBUTE, themeId);
    },
    set(themeId) {
      const resolved = resolveThemeId(themeId);
      storage.write(resolved);
      this.apply(resolved);
      listeners.forEach((listener) => listener());
    },
  };
};

export const themeStore = createThemeStore(browserThemeStorage);
