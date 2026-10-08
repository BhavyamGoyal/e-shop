export function parseCsv(source: string): string[][] {
  const text: string = source.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell: string = "";
  let quoted: boolean = false;

  const endCell = (): void => {
    row.push(cell);
    cell = "";
  };
  const endRow = (): void => {
    endCell();
    if (row.some((value: string): boolean => value.trim() !== "")) rows.push(row);
    row = [];
  };

  for (let index = 0; index < text.length; index++) {
    const char: string = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index++;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") endCell();
    else if (char === "\n") endRow();
    else if (char !== "\r") cell += char;
  }
  endRow();
  return rows;
}
