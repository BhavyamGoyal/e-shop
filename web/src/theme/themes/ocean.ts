import { defineTheme } from "../types";

export const oceanTheme = defineTheme({
  id: "ocean",
  label: "Ocean",
  colorScheme: "light",
  colors: {
    background: "#f0f9ff",
    foreground: "#082f49",
    surface: "#ffffff",
    "surface-foreground": "#082f49",
    muted: "#e0f2fe",
    "muted-foreground": "#0369a1",
    border: "#bae6fd",
    ring: "#0284c7",
    primary: "#0284c7",
    "primary-foreground": "#ffffff",
    secondary: "#bae6fd",
    "secondary-foreground": "#082f49",
    accent: "#0d9488",
    "accent-foreground": "#ffffff",
    success: "#059669",
    "success-foreground": "#ffffff",
    warning: "#ea580c",
    "warning-foreground": "#ffffff",
    danger: "#e11d48",
    "danger-foreground": "#ffffff",
  },
});
