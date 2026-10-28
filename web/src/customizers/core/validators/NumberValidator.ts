import { BaseParamValidator } from "../ParamValidator";
import type { ParamDefinition, ParamType, ParamValue } from "../types";

export class NumberValidator extends BaseParamValidator {
  readonly types: readonly ParamType[] = ["number"];

  normalize(definition: ParamDefinition, raw: unknown): ParamValue {
    const value: number = typeof raw === "number" ? raw : Number.NaN;
    if (!Number.isFinite(value)) return definition.default;
    const low: number = definition.min ?? Number.NEGATIVE_INFINITY;
    const high: number = definition.max ?? Number.POSITIVE_INFINITY;
    return Math.min(high, Math.max(low, value));
  }
}
