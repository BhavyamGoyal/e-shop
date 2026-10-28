import { defaultValidatorRegistry } from "./ParamValidatorRegistry";
import { PARAM_TYPES, type ParamDefinition, type ParamOption } from "./types";

const KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;
const OPTION_TYPES: readonly string[] = ["select", "font"];

export function checkDefinitions(definitions: ParamDefinition[]): string | null {
  const seen: Set<string> = new Set();
  for (const definition of definitions) {
    const label: string = `Param "${definition.key}"`;
    if (!KEY_PATTERN.test(definition.key)) return `${label} has an invalid key`;
    if (seen.has(definition.key)) return `${label} is duplicated`;
    seen.add(definition.key);
    if (!PARAM_TYPES.includes(definition.type)) return `${label} has an unknown type`;
    if (!definition.label) return `${label} needs a label`;
    const options: ParamOption[] = definition.options ?? [];
    if (OPTION_TYPES.includes(definition.type) && !options.some((option: ParamOption): boolean => option.value === definition.default)) {
      return `${label} default must be one of its options`;
    }
    if (definition.min !== undefined && definition.max !== undefined && definition.min > definition.max) {
      return `${label} min is greater than max`;
    }
    if (!defaultValidatorRegistry.get(definition.type).isValidDefault(definition)) {
      return `${label} default is not valid for its type`;
    }
  }
  return null;
}
