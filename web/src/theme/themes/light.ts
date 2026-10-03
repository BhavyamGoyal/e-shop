import { defineTheme } from "../types";

export const lightTheme = defineTheme({
  id: "light",
  label: "Light",
  colorScheme: "light",
  colors: {
    background: "#ffffff",
    foreground: "#0f172a",
    surface: "#f8fafc",
    "surface-foreground": "#0f172a",
    muted: "#f1f5f9",
    "muted-foreground": "#64748b",
    border: "#e2e8f0",
    ring: "#6366f1",
    primary: "#4f46e5",
    "primary-foreground": "#ffffff",
    secondary: "#e2e8f0",
    "secondary-foreground": "#0f172a",
    accent: "#db2777",
    "accent-foreground": "#ffffff",
    success: "#16a34a",
    "success-foreground": "#ffffff",
    warning: "#d97706",
    "warning-foreground": "#ffffff",
    danger: "#dc2626",
    "danger-foreground": "#ffffff",
  },
});
