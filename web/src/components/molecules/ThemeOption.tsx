import { Button, Swatch } from "../atoms";
import type { Theme } from "@/theme";

export interface ThemeOptionProps {
  theme: Theme;
  selected: boolean;
  onSelect: (themeId: string) => void;
}

export function ThemeOption({ theme, selected, onSelect }: ThemeOptionProps) {
  return (
    <Button
      tone="secondary"
      variant={selected ? "solid" : "outline"}
      size="sm"
      aria-pressed={selected}
      onClick={() => onSelect(theme.id)}
    >
      <Swatch color={theme.colors.background} />
      <Swatch color={theme.colors.primary} className="-ml-3" />
      <Swatch color={theme.colors.accent} className="-ml-3" />
      {theme.label}
    </Button>
  );
}
