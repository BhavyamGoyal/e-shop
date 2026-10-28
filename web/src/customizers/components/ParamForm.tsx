import type { ParamDefinition, ParamValue, ParamValues } from "../core";
import { ParamField } from "./ParamField";

const DEFAULT_GROUP = "Options";

interface ParamFormProps {
  definitions: ParamDefinition[];
  values: ParamValues;
  onChange: (key: string, value: ParamValue) => void;
}

function groupByName(definitions: ParamDefinition[]): [string, ParamDefinition[]][] {
  const groups: Map<string, ParamDefinition[]> = new Map();
  for (const definition of definitions) {
    const name: string = definition.group ?? DEFAULT_GROUP;
    groups.set(name, [...(groups.get(name) ?? []), definition]);
  }
  return [...groups.entries()];
}

export function ParamForm({ definitions, values, onChange }: ParamFormProps) {
  const editable: ParamDefinition[] = definitions.filter((definition: ParamDefinition): boolean => definition.mutable);
  return (
    <div className="flex flex-col gap-6">
      {groupByName(editable).map(([name, group]: [string, ParamDefinition[]]) => (
        <section key={name} className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{name}</h2>
          {group.map((definition: ParamDefinition) => (
            <ParamField
              key={definition.key}
              definition={definition}
              value={values[definition.key] ?? definition.default}
              onChange={(value: ParamValue): void => onChange(definition.key, value)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
