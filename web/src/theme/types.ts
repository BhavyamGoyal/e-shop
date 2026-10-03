export const THEME_TOKENS = [
  "background",
  "foreground",
  "surface",
  "surface-foreground",
  "muted",
  "muted-foreground",
  "border",
  "ring",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "accent",
  "accent-foreground",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "danger",
  "danger-foreground",
] as const;

export type ThemeToken = (typeof THEME_TOKENS)[number];

export type ThemeColors = Record<ThemeToken, string>;

export type ColorScheme = "light" | "dark";

export interface Theme {
  readonly id: string;
  readonly label: string;
  readonly colorScheme: ColorScheme;
  readonly colors: ThemeColors;
}

export const defineTheme = (theme: Theme): Theme => theme;
