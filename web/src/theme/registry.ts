import { darkTheme } from "./themes/dark";
import { forestTheme } from "./themes/forest";
import { lightTheme } from "./themes/light";
import { oceanTheme } from "./themes/ocean";
import { sunsetTheme } from "./themes/sunset";
import type { Theme } from "./types";

export const themes: readonly Theme[] = [
  lightTheme,
  darkTheme,
  oceanTheme,
  sunsetTheme,
  forestTheme,
];

export const DEFAULT_THEME_ID = lightTheme.id;

export const isThemeId = (value: string | null | undefined): value is string =>
  themes.some((theme) => theme.id === value);

export const resolveThemeId = (value: string | null | undefined): string =>
  isThemeId(value) ? value : DEFAULT_THEME_ID;
