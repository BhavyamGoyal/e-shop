import { defineTheme } from "../types";

export const sunsetTheme = defineTheme({
  id: "sunset",
  label: "Sunset",
  colorScheme: "light",
  colors: {
    background: "#fff7ed",
    foreground: "#431407",
    surface: "#ffffff",
    "surface-foreground": "#431407",
    muted: "#ffedd5",
    "muted-foreground": "#9a3412",
    border: "#fed7aa",
    ring: "#ea580c",
    primary: "#ea580c",
    "primary-foreground": "#ffffff",
    secondary: "#fed7aa",
    "secondary-foreground": "#431407",
    accent: "#be123c",
    "accent-foreground": "#ffffff",
    success: "#15803d",
    "success-foreground": "#ffffff",
    warning: "#ca8a04",
    "warning-foreground": "#ffffff",
    danger: "#b91c1c",
    "danger-foreground": "#ffffff",
  },
});
