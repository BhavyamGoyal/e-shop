export type Point = [number, number];
export type Contour = Point[];
export type ContourGroup = Contour[];

export interface Polygon {
  outer: Contour;
  holes: Contour[];
}

export interface Layer {
  name: LayerName;
  polys: Polygon[];
  z0: number;
  z1: number;
}

export type LayerName = "Base" | "Text";

export interface MeshData {
  positions: number[];
  indices: number[];
}

export interface MeshInfo {
  open: number;
  nonManifold: number;
  triangles: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export type Align = "left" | "center" | "right";
export type RingPosition =
  | "left"
  | "right"
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "none";

export interface KeychainParams {
  text: string;
  font: string;
  size: number;
  spacing: number;
  lineHeight: number;
  align: Align;
  textColor: string;
  angle: number;
  baseColor: string;
  merge: boolean;
  join: number;
  useBase: boolean;
  baseH: number;
  outline: number;
  textH: number;
  ring: RingPosition;
  holeD: number;
  wall: number;
  overlap: number;
  shiftX: number;
  shiftY: number;
}

export interface Part {
  name: LayerName;
  color: string;
  positions: number[];
  indices: number[];
}
