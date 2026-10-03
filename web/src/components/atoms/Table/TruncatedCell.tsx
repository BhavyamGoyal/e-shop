import { CopyButton } from "@/components/atoms/Controls/CopyButton";
import type { TruncatedCellProps } from "@/components/atoms/Table/TruncatedCell.types";

export function TruncatedCell({ value, maxWidth = "15rem", className, copyable = false }: TruncatedCellProps) {
  return (
    <span className="inline-flex items-center" style={{ maxWidth }}>
      <span className={`truncate ${className ?? ""}`} title={value}>
        {value}
      </span>
      {copyable && <CopyButton value={value} />}
    </span>
  );
}
