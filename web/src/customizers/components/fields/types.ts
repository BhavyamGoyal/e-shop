import type { ParamDefinition, ParamValue } from "../../core";

export interface ParamFieldProps {
  definition: ParamDefinition;
  value: ParamValue;
  onChange: (value: ParamValue) => void;
}
