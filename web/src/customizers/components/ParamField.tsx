import type { ComponentType } from "react";
import type { ParamType } from "../core";
import { BooleanParamField } from "./fields/BooleanParamField";
import { ColorParamField } from "./fields/ColorParamField";
import { NumberParamField } from "./fields/NumberParamField";
import { SelectParamField } from "./fields/SelectParamField";
import { TextParamField } from "./fields/TextParamField";
import type { ParamFieldProps } from "./fields/types";

const FIELDS: Record<ParamType, ComponentType<ParamFieldProps>> = {
  text: TextParamField,
  textarea: TextParamField,
  number: NumberParamField,
  select: SelectParamField,
  font: SelectParamField,
  color: ColorParamField,
  boolean: BooleanParamField,
};

export function ParamField(props: ParamFieldProps) {
  const Field: ComponentType<ParamFieldProps> = FIELDS[props.definition.type];
  return <Field {...props} />;
}
