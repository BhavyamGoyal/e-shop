import { BaseParamValidator } from "../ParamValidator";
import type { ParamDefinition, ParamType, ParamValue } from "../types";

export class BooleanValidator extends BaseParamValidator {
  readonly types: readonly ParamType[] = ["boolean"];

  normalize(definition: ParamDefinition, raw: unknown): ParamValue {
    return typeof raw === "boolean" ? raw : definition.default;
  }
}
