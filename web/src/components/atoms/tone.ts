export type Tone =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export const toneSolid: Record<Tone, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-danger text-danger-foreground",
};

export const toneSoft: Record<Tone, string> = {
  primary: "bg-primary/15 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

export const toneOutline: Record<Tone, string> = {
  primary: "border border-primary text-primary",
  secondary: "border border-border text-foreground",
  accent: "border border-accent text-accent",
  success: "border border-success text-success",
  warning: "border border-warning text-warning",
  danger: "border border-danger text-danger",
};
