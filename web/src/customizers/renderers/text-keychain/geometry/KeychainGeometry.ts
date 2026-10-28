import type { Font } from "opentype.js";
import type { Paths } from "clipper-lib";
import { GlyphLayout, type LaidText } from "./GlyphLayout";
import { PathOps } from "./PathOps";
import { RingBuilder, type RingShape } from "./RingShape";
import type { ContourGroup, KeychainParams, Layer, Polygon } from "./types";

const MIN_CLOSE = 0.03;
const MIN_TEXT_HEIGHT = 0.4;

export class KeychainGeometry {
  constructor(
    private readonly layout: GlyphLayout = new GlyphLayout(),
    private readonly ops: PathOps = new PathOps(),
    private readonly rings: RingBuilder = new RingBuilder(ops),
  ) {}

  build(font: Font, params: KeychainParams): Layer[] {
    const laid: LaidText = this.layout.layout(font, params.text, {
      size: params.size,
      spacing: params.spacing,
      lineHeight: params.lineHeight,
      align: params.align,
    });
    const groups: ContourGroup[] = this.layout.center(
      laid.groups.map((group: ContourGroup): ContourGroup => this.layout.bend(group, laid.width, params.angle)),
    );
    const groupPaths: Paths[] = groups.map((group: ContourGroup): Paths =>
      this.ops.closing(this.ops.union(this.ops.toPaths(group)), MIN_CLOSE),
    );
    const textPaths: Paths = this.ops.union(groupPaths.flat());
    if (!textPaths.length) return [];

    const joined: Paths = this.ops.closing(textPaths, Math.max(params.join, MIN_CLOSE));
    const hasBase: boolean = params.useBase && params.baseH > 0;
    const anchor: Paths = hasBase ? this.ops.offset(joined, params.outline) : joined;
    const ring: RingShape | null = params.ring === "none" ? null : this.rings.build(params, this.ops.bounds(anchor));
    const textPolys = (withRing: boolean): Polygon[] => this.textPolygons(params, joined, groupPaths, ring, withRing);

    const layers: Layer[] = [];
    if (hasBase) {
      let plate: Paths = this.ops.union(this.ops.offset(joined, params.outline));
      if (ring) plate = this.ops.difference(this.ops.union(plate, ring.body), ring.hole);
      layers.push({ name: "Base", polys: this.ops.toPolygons(plate), z0: 0, z1: params.baseH });
      if (params.textH > 0) {
        layers.push({ name: "Text", polys: textPolys(false), z0: params.baseH, z1: params.baseH + params.textH });
      }
    } else {
      layers.push({ name: "Text", polys: textPolys(true), z0: 0, z1: Math.max(params.textH, MIN_TEXT_HEIGHT) });
    }
    return layers.filter((layer: Layer): boolean => layer.polys.length > 0);
  }

  private textPolygons(
    params: KeychainParams,
    joined: Paths,
    groupPaths: Paths[],
    ring: RingShape | null,
    withRing: boolean,
  ): Polygon[] {
    if (params.merge) {
      let shape: Paths = joined;
      if (withRing && ring) shape = this.ops.union(shape, ring.body);
      if (ring) shape = this.ops.difference(shape, ring.hole);
      return this.ops.toPolygons(shape);
    }
    let polys: Polygon[] = [];
    for (const groupPath of groupPaths) {
      polys = polys.concat(this.ops.toPolygons(ring ? this.ops.difference(groupPath, ring.hole) : groupPath));
    }
    if (withRing && ring) polys = polys.concat(this.ops.toPolygons(this.ops.difference(ring.body, ring.hole)));
    return polys;
  }
}
