import { THEME_TOKENS, type Theme, type ThemeToken } from "./types";

export const THEME_ATTRIBUTE = "data-theme";

export const tokenVar = (token: ThemeToken): string => `--${token}`;

export const tokenRef = (token: ThemeToken): string => `var(${tokenVar(token)})`;

const declarations = (theme: Theme): string =>
  THEME_TOKENS.map((token) => `${tokenVar(token)}:${theme.colors[token]};`).join("");

const rule = (theme: Theme): string =>
  `[${THEME_ATTRIBUTE}="${theme.id}"]{color-scheme:${theme.colorScheme};${declarations(theme)}}`;

export const buildThemesCss = (themes: readonly Theme[]): string =>
  themes.map(rule).join("");
