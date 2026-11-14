import type { ParamDefinition, ParamValue, ParamValues } from "../core";
import { ParamField } from "./ParamField";

interface ParamFormProps {
  definitions: ParamDefinition[];
  values: ParamValues;
  onChange: (key: string, value: ParamValue) => void;
}

export function ParamForm({ definitions, values, onChange }: ParamFormProps) {
  const editable: ParamDefinition[] = definitions.filter((definition: ParamDefinition): boolean => definition.mutable);
  return (
    <div className="flex flex-col gap-4">
      {editable.map((definition: ParamDefinition) => (
        <ParamField
          key={definition.key}
          definition={definition}
          value={values[definition.key] ?? definition.default}
          onChange={(value: ParamValue): void => onChange(definition.key, value)}
        />
      ))}
    </div>
  );
}
