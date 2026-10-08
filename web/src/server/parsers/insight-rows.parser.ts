import { ValidationError } from "../http/errors";
import type { ImportFormat } from "../types/instagram.types";
import { parseCsv } from "./csv.parser";

export type InsightRow = Record<string, string>;

const normalizeKey = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]/g, "");

const stringify = (value: unknown): string => (value === null || value === undefined ? "" : String(value).trim());

const toRow = (entries: [string, unknown][]): InsightRow =>
  Object.fromEntries(entries.map(([key, value]: [string, unknown]): [string, string] => [normalizeKey(key), stringify(value)]));

function fromCsv(content: string): InsightRow[] {
  const [header, ...body] = parseCsv(content);
  if (!header) throw new ValidationError("The file is empty");
  return body.map((cells: string[]): InsightRow =>
    toRow(header.map((name: string, index: number): [string, unknown] => [name, cells[index]])),
  );
}

function fromJson(content: string): InsightRow[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ValidationError("The file is not valid JSON");
  }
  if (!Array.isArray(parsed)) throw new ValidationError("JSON must be an array of records");
  return parsed
    .filter((item: unknown): boolean => typeof item === "object" && item !== null)
    .map((item: unknown): InsightRow => toRow(Object.entries(item as Record<string, unknown>)));
}

export const parseInsightRows = (format: ImportFormat, content: string): InsightRow[] =>
  format === "json" ? fromJson(content) : fromCsv(content);
