import { BaseParamValidator } from "../ParamValidator";
import type { ParamDefinition, ParamType, ParamValue } from "../types";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export class ColorValidator extends BaseParamValidator {
  readonly types: readonly ParamType[] = ["color"];

  normalize(definition: ParamDefinition, raw: unknown): ParamValue {
    return typeof raw === "string" && HEX_COLOR.test(raw) ? raw.toLowerCase() : definition.default;
  }
}
