export type ParamValue = string | number | boolean;
export type ParamValues = Record<string, ParamValue>;

export const PARAM_TYPES = ["text", "textarea", "number", "select", "color", "boolean", "font"] as const;
export type ParamType = (typeof PARAM_TYPES)[number];

export interface ParamOption {
  value: string;
  label: string;
  meta?: Record<string, string | number>;
}

export interface ParamDefinition {
  key: string;
  type: ParamType;
  label: string;
  group?: string;
  default: ParamValue;
  mutable: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  maxLength?: number;
  options?: ParamOption[];
  hint?: string;
}

export interface CustomizerConfig {
  slug: string;
  title: string;
  renderer: string;
  params: ParamDefinition[];
  active: boolean;
  version: number;
}

export interface CartCustomization {
  slug: string;
  renderer: string;
  version: number;
  params: ParamValues;
}
