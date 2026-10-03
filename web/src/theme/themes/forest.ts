import { defineTheme } from "../types";

export const forestTheme = defineTheme({
  id: "forest",
  label: "Forest",
  colorScheme: "dark",
  colors: {
    background: "#0a1410",
    foreground: "#dcfce7",
    surface: "#10201a",
    "surface-foreground": "#dcfce7",
    muted: "#173026",
    "muted-foreground": "#86efac",
    border: "#1f4234",
    ring: "#34d399",
    primary: "#34d399",
    "primary-foreground": "#052e1c",
    secondary: "#1f4234",
    "secondary-foreground": "#dcfce7",
    accent: "#fbbf24",
    "accent-foreground": "#3b2a00",
    success: "#4ade80",
    "success-foreground": "#052e1c",
    warning: "#fb923c",
    "warning-foreground": "#3b1a00",
    danger: "#fb7185",
    "danger-foreground": "#3f0a14",
  },
});
