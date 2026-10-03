export interface ColumnResizeHandleProps {
  label: string;
  width: number;
  min: number;
  onResize: (width: number) => void;
}
