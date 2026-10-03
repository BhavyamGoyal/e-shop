import type { ColumnConfig } from "@/components/organisms/Table/Table.types";

export async function exportToExcel<TRow>(rows: TRow[], columns: ColumnConfig<TRow>[], filename: string): Promise<void> {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");
  worksheet.addRow(columns.map((col) => col.header));
  rows.forEach((row) => worksheet.addRow(columns.map((col) => cellValue(col, row))));
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv<TRow>(rows: TRow[], columns: ColumnConfig<TRow>[], filename: string): void {
  const header = columns.map((col) => escapeCsv(col.header)).join(",");
  const body = rows.map((row) => columns.map((col) => escapeCsv(cellValue(col, row))).join(",")).join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function cellValue<TRow>(col: ColumnConfig<TRow>, row: TRow): string {
  if (col.filterValue) return col.filterValue(row);
  const raw = (row as Record<string, unknown>)[col.key];
  return raw != null ? String(raw) : "";
}

function escapeCsv(value: string): string {
  if (!value.includes(",") && !value.includes('"') && !value.includes("\n")) return value;
  return `"${value.replace(/"/g, '""')}"`;
}
