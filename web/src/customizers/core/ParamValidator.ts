import type { ParamDefinition, ParamType, ParamValue } from "./types";

export interface IParamValidator {
  readonly types: readonly ParamType[];
  normalize(definition: ParamDefinition, raw: unknown): ParamValue;
  isValidDefault(definition: ParamDefinition): boolean;
}

export abstract class BaseParamValidator implements IParamValidator {
  abstract readonly types: readonly ParamType[];

  abstract normalize(definition: ParamDefinition, raw: unknown): ParamValue;

  isValidDefault(definition: ParamDefinition): boolean {
    return this.normalize(definition, definition.default) === definition.default;
  }
}
