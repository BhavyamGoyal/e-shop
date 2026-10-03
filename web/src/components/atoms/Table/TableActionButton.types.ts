import type { ReactNode } from "react";

export type TableActionTone = "default" | "destructive";

export interface TableActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone?: TableActionTone;
}
