import { checkDefinitions, PARAM_TYPES, type ParamDefinition, type ParamOption, type ParamType, type ParamValue } from "@/customizers/core";
import { RENDERER_KEYS } from "@/customizers/renderers/keys";
import { ValidationError } from "../http/errors";
import type { CustomizerInput } from "../types/customizer.types";
import { slugify } from "./product-input";

type Raw = Record<string, unknown>;

const asRecord = (value: unknown): Raw => (value && typeof value === "object" ? (value as Raw) : {});
const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

function optionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed: number = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toOption(value: unknown): ParamOption {
  const raw: Raw = asRecord(value);
  const option: ParamOption = { value: text(raw.value), label: text(raw.label) || text(raw.value) };
  const meta: Raw = asRecord(raw.meta);
  const entries: [string, string | number][] = Object.entries(meta).filter(
    (entry: [string, unknown]): entry is [string, string | number] =>
      typeof entry[1] === "string" || typeof entry[1] === "number",
  );
  return entries.length ? { ...option, meta: Object.fromEntries(entries) } : option;
}

function toDefault(type: ParamType, value: unknown): ParamValue {
  if (type === "boolean") return value === true;
  if (type === "number") return Number.isFinite(Number(value)) && value !== "" ? Number(value) : 0;
  return typeof value === "string" ? value : "";
}

function toParam(value: unknown): ParamDefinition {
  const raw: Raw = asRecord(value);
  const type: ParamType = PARAM_TYPES.includes(raw.type as ParamType) ? (raw.type as ParamType) : "text";
  const options: ParamOption[] = list(raw.options).map(toOption).filter((option: ParamOption): boolean => option.value.length > 0);
  const param: ParamDefinition = {
    key: text(raw.key),
    type,
    label: text(raw.label),
    default: toDefault(type, raw.default),
    mutable: raw.mutable !== false,
  };
  const group: string = text(raw.group);
  const unit: string = text(raw.unit);
  const hint: string = text(raw.hint);
  if (group) param.group = group;
  if (unit) param.unit = unit;
  if (hint) param.hint = hint;
  for (const field of ["min", "max", "step", "maxLength"] as const) {
    const parsed: number | undefined = optionalNumber(raw[field]);
    if (parsed !== undefined) param[field] = parsed;
  }
  if (options.length) param.options = options;
  return param;
}

export function parseCustomizerInput(payload: unknown): CustomizerInput {
  const raw: Raw = asRecord(payload);
  const title: string = text(raw.title);
  if (!title) throw new ValidationError("Title is required");
  const slug: string = slugify(text(raw.slug) || title);
  if (!slug) throw new ValidationError("Slug is required");
  const renderer: string = text(raw.renderer);
  if (!RENDERER_KEYS.includes(renderer)) throw new ValidationError("Unknown renderer");
  const params: ParamDefinition[] = list(raw.params).map(toParam);
  const problem: string | null = checkDefinitions(params);
  if (problem) throw new ValidationError(problem);
  return { slug, title, renderer, params, active: raw.active !== false };
}
