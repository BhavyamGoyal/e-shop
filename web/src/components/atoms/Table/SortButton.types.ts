import type { SortDirection } from "@/components/organisms/Table/Table.types";

export interface SortButtonProps {
  label: string;
  direction: SortDirection | null;
  onClick: () => void;
}
