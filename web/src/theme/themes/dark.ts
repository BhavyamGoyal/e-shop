import { defineTheme } from "../types";

export const darkTheme = defineTheme({
  id: "dark",
  label: "Dark",
  colorScheme: "dark",
  colors: {
    background: "#0b0f1a",
    foreground: "#e2e8f0",
    surface: "#131a2a",
    "surface-foreground": "#e2e8f0",
    muted: "#1b2438",
    "muted-foreground": "#94a3b8",
    border: "#26314a",
    ring: "#818cf8",
    primary: "#818cf8",
    "primary-foreground": "#0b0f1a",
    secondary: "#26314a",
    "secondary-foreground": "#e2e8f0",
    accent: "#f472b6",
    "accent-foreground": "#0b0f1a",
    success: "#4ade80",
    "success-foreground": "#0b0f1a",
    warning: "#fbbf24",
    "warning-foreground": "#0b0f1a",
    danger: "#f87171",
    "danger-foreground": "#0b0f1a",
  },
});
