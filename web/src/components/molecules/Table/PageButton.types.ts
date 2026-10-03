import type { ReactNode } from "react";

export interface PageButtonProps {
  active?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  ariaCurrent?: boolean;
  onSelect: () => void;
  children: ReactNode;
}
