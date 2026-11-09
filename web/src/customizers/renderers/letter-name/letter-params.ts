import type { ParamValues } from "../../core";
import type { LetterNameParams } from "./letter-types";

const text = (values: ParamValues, key: string): string => String(values[key] ?? "");
const num = (values: ParamValues, key: string): number => Number(values[key] ?? 0);

export function toLetterNameParams(values: ParamValues): LetterNameParams {
  const [first = "", ...rest]: string[] = Array.from(text(values, "name").trim());
  return {
    letter: first.toUpperCase(),
    nameFirst: first.toUpperCase(),
    nameRest: rest.join("").toLowerCase(),
    letterFont: text(values, "letterFont"),
    nameFont: text(values, "nameFont"),
    letterSize: num(values, "letterSize"),
    nameFit: num(values, "nameFit"),
    nameFirstScale: num(values, "nameFirstScale"),
    letterH: num(values, "letterH"),
    nameH: num(values, "nameH"),
    letterColor: text(values, "letterColor"),
    nameColor: text(values, "nameColor"),
  };
}
