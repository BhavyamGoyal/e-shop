import { defaultValidatorRegistry, type ParamValidatorRegistry } from "./ParamValidatorRegistry";
import type { ParamDefinition, ParamValue, ParamValues } from "./types";

export class ParamResolver {
  constructor(private readonly registry: ParamValidatorRegistry) {}

  defaults(definitions: ParamDefinition[]): ParamValues {
    return Object.fromEntries(
      definitions.map((definition: ParamDefinition): [string, ParamValue] => [definition.key, definition.default]),
    );
  }

  resolve(definitions: ParamDefinition[], input: unknown): ParamValues {
    const source: Record<string, unknown> =
      input && typeof input === "object" ? (input as Record<string, unknown>) : {};
    return Object.fromEntries(
      definitions.map((definition: ParamDefinition): [string, ParamValue] => {
        if (!definition.mutable || !(definition.key in source)) return [definition.key, definition.default];
        return [definition.key, this.registry.get(definition.type).normalize(definition, source[definition.key])];
      }),
    );
  }
}

export const paramResolver: ParamResolver = new ParamResolver(defaultValidatorRegistry);
