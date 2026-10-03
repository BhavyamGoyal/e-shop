import type { TableActionButtonProps, TableActionTone } from "@/components/atoms/Table/TableActionButton.types";

const BASE = "inline-flex items-center justify-center rounded-md border p-1.5 transition-colors";
const TONE: Record<TableActionTone, string> = {
  default: "border-border bg-surface text-foreground hover:bg-muted",
  destructive: "border-danger/30 bg-danger/10 text-danger hover:bg-danger/20",
};

export function TableActionButton({ icon, label, onClick, tone = "default" }: TableActionButtonProps) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className={`${BASE} ${TONE[tone]}`}>
      {icon}
    </button>
  );
}
