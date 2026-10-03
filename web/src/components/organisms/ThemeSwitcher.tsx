"use client";

import { ThemeOption } from "../molecules";
import { useTheme } from "@/theme";

export function ThemeSwitcher() {
  const { theme, themes, setTheme } = useTheme();

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Theme">
      {themes.map((item) => (
        <ThemeOption
          key={item.id}
          theme={item}
          selected={item.id === theme.id}
          onSelect={setTheme}
        />
      ))}
    </div>
  );
}
