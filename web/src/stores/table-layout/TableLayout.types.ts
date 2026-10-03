export interface TableColumnLayout {
  order: string[];
  widths: Record<string, number>;
}

export interface TableLayoutState {
  layouts: Record<string, TableColumnLayout>;
  setOrder: (id: string, order: string[]) => void;
  setWidth: (id: string, columnKey: string, width: number) => void;
  reset: (id: string) => void;
}
