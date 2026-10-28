import type { ParamValues } from "../../core";
import type { Align, KeychainParams, RingPosition } from "./geometry/types";

const text = (values: ParamValues, key: string): string => String(values[key] ?? "");
const num = (values: ParamValues, key: string): number => Number(values[key] ?? 0);
const flag = (values: ParamValues, key: string): boolean => values[key] === true;

export function toKeychainParams(values: ParamValues): KeychainParams {
  return {
    text: text(values, "text"),
    font: text(values, "font"),
    size: num(values, "size"),
    spacing: num(values, "spacing"),
    lineHeight: num(values, "lineHeight"),
    align: text(values, "align") as Align,
    textColor: text(values, "textColor"),
    angle: num(values, "angle"),
    baseColor: text(values, "baseColor"),
    merge: flag(values, "merge"),
    join: num(values, "join"),
    useBase: flag(values, "useBase"),
    baseH: num(values, "baseH"),
    outline: num(values, "outline"),
    textH: num(values, "textH"),
    ring: text(values, "ring") as RingPosition,
    holeD: num(values, "holeD"),
    wall: num(values, "wall"),
    overlap: num(values, "overlap"),
    shiftX: num(values, "shiftX"),
    shiftY: num(values, "shiftY"),
  };
}
