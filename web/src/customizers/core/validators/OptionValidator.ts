import { BaseParamValidator } from "../ParamValidator";
import type { ParamDefinition, ParamOption, ParamType, ParamValue } from "../types";

export class OptionValidator extends BaseParamValidator {
  readonly types: readonly ParamType[] = ["select", "font"];

  normalize(definition: ParamDefinition, raw: unknown): ParamValue {
    const known: boolean = (definition.options ?? []).some((option: ParamOption): boolean => option.value === raw);
    return known && typeof raw === "string" ? raw : definition.default;
  }
}
