import { BaseParamValidator } from "../ParamValidator";
import type { ParamDefinition, ParamType, ParamValue } from "../types";

const DEFAULT_MAX_LENGTH = 200;
const CONTROL_CHARS = /[\u0000-\u0008\u000B-\u001F\u007F]/g;

export class TextValidator extends BaseParamValidator {
  readonly types: readonly ParamType[] = ["text", "textarea"];

  normalize(definition: ParamDefinition, raw: unknown): ParamValue {
    if (typeof raw !== "string") return definition.default;
    const limit: number = definition.maxLength ?? DEFAULT_MAX_LENGTH;
    const cleaned: string = raw.replace(CONTROL_CHARS, "");
    const single: string = definition.type === "text" ? cleaned.replace(/\n/g, " ") : cleaned;
    return single.slice(0, limit);
  }
}
