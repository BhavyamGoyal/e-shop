import type { Font } from "opentype.js";
import type { Paths } from "clipper-lib";
import { GlyphLayout, type LaidText } from "../text-keychain/geometry/GlyphLayout";
import { PathOps } from "../text-keychain/geometry/PathOps";
import type { Bounds, Contour, ContourGroup, Layer, Point } from "../text-keychain/geometry/types";
import type { LetterNameParams } from "./letter-types";

const MIN_CLOSE = 0.03;
const DEFAULT_CAP_RATIO = 0.7;

export class LetterNameGeometry {
  constructor(
    private readonly layout: GlyphLayout = new GlyphLayout(),
    private readonly ops: PathOps = new PathOps(),
  ) {}

  build(letterFont: Font, nameFont: Font, params: LetterNameParams): Layer[] {
    const letter: Paths = this.letterPaths(letterFont, params);
    const name: Paths = this.namePaths(nameFont, params, letter);
    const raised: boolean = name.length > 0 && params.nameH > 0;
    const layers: Layer[] = [{ name: "Letter", polys: this.ops.toPolygons(letter), z0: 0, z1: params.letterH }];
    if (raised) {
      layers.push({ name: "Name", polys: this.ops.toPolygons(name), z0: params.letterH, z1: params.letterH + params.nameH });
    }
    return layers.filter((layer: Layer): boolean => layer.polys.length > 0);
  }

  private letterPaths(font: Font, params: LetterNameParams): Paths {
    if (!params.letter) return [];
    const laid: LaidText = this.layout.layout(font, params.letter, {
      size: params.letterSize / this.capRatio(font),
      spacing: 0,
      lineHeight: 1,
      align: "center",
    });
    return this.union(this.layout.center(laid.groups));
  }

  private capRatio(font: Font): number {
    const os2: { sCapHeight?: number } | undefined = (font.tables as { os2?: { sCapHeight?: number } }).os2;
    const cap: number = os2?.sCapHeight ?? 0;
    return cap > 0 ? cap / font.unitsPerEm : DEFAULT_CAP_RATIO;
  }

  private namePaths(font: Font, params: LetterNameParams, letter: Paths): Paths {
    if (!params.nameFirst) return [];
    const centered: ContourGroup[] = this.layout.center(this.nameGroups(font, params));
    const scale: number = this.fitScale(centered, letter, params);
    return this.union(centered.map((group: ContourGroup): ContourGroup => this.scaled(group, scale)));
  }

  private nameGroups(font: Font, params: LetterNameParams): ContourGroup[] {
    const firstSize: number = params.letterSize * params.nameFirstScale;
    const first: LaidText = this.run(font, params.nameFirst, firstSize);
    const rest: LaidText = params.nameRest ? this.run(font, params.nameRest, params.letterSize) : { groups: [], width: 0 };
    return [...this.shifted(first, 0), ...this.shifted(rest, first.width)];
  }

  private run(font: Font, text: string, size: number): LaidText {
    return this.layout.layout(font, text, { size, spacing: 0, lineHeight: 1, align: "left" });
  }

  private shifted(laid: LaidText, offset: number): ContourGroup[] {
    const dx: number = offset + laid.width / 2;
    return laid.groups.map((group: ContourGroup): ContourGroup =>
      group.map((contour: Contour): Contour => contour.map((p: Point): Point => [p[0] + dx, p[1]])),
    );
  }

  private fitScale(groups: ContourGroup[], letter: Paths, params: LetterNameParams): number {
    const name: Bounds = this.ops.bounds(this.ops.toPaths(groups.flat()));
    const width: number = name.maxX - name.minX;
    const height: number = name.maxY - name.minY;
    if (width <= 0 || height <= 0) return 1;
    const target: Bounds = letter.length
      ? this.ops.bounds(letter)
      : { minX: -params.letterSize / 2, maxX: params.letterSize / 2, minY: -params.letterSize / 2, maxY: params.letterSize / 2 };
    const fitWidth: number = ((target.maxX - target.minX) * params.nameFit) / width;
    const fitHeight: number = ((target.maxY - target.minY) * params.nameFit) / height;
    return Math.min(fitWidth, fitHeight);
  }

  private scaled(group: ContourGroup, scale: number): ContourGroup {
    return group.map((contour: Contour): Contour => contour.map((p: Point): Point => [p[0] * scale, p[1] * scale]));
  }

  private union(groups: ContourGroup[]): Paths {
    const closed: Paths[] = groups.map((group: ContourGroup): Paths =>
      this.ops.closing(this.ops.union(this.ops.toPaths(group)), MIN_CLOSE),
    );
    return this.ops.union(closed.flat());
  }
}
