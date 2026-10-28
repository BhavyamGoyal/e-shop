import type { Path, Paths } from "clipper-lib";
import type { PathOps } from "./PathOps";
import type { Bounds, KeychainParams } from "./types";

export interface RingShape {
  body: Paths;
  hole: Paths;
}

export class RingBuilder {
  constructor(private readonly ops: PathOps) {}

  build(params: KeychainParams, anchor: Bounds): RingShape {
    const outerR: number = params.holeD / 2 + params.wall;
    const holeR: number = params.holeD / 2;
    const midX: number = (anchor.minX + anchor.maxX) / 2;
    const midY: number = (anchor.minY + anchor.maxY) / 2;
    const [vertical, horizontal] = params.ring.split("-");
    const pure: boolean = horizontal === undefined;
    let cx: number = midX;
    let cy: number = midY;
    if (params.ring === "left" || horizontal === "left") {
      cx = pure ? anchor.minX - outerR + params.overlap : anchor.minX + outerR - params.overlap;
    } else if (params.ring === "right" || horizontal === "right") {
      cx = pure ? anchor.maxX + outerR - params.overlap : anchor.maxX - outerR + params.overlap;
    }
    if (vertical === "top") cy = anchor.maxY + outerR - params.overlap;
    else if (vertical === "bottom") cy = anchor.minY - outerR + params.overlap;
    cx += params.shiftX;
    cy += params.shiftY;
    const body: Path = this.ops.circle(cx, cy, outerR);
    const hole: Path = this.ops.circle(cx, cy, holeR);
    return { body: [body], hole: [hole] };
  }
}
