export interface ThemeStorage {
  read(): string | null;
  write(themeId: string): void;
}

export const THEME_STORAGE_KEY = "app-theme";

export const browserThemeStorage: ThemeStorage = {
  read() {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  write(themeId) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch {
      return;
    }
  },
};
