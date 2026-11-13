import * as opentype from "opentype.js";

export interface GlyphPatch {
  char: string;
  donor: string;
}

export interface CompositeFontSpec {
  base: string;
  patches: GlyphPatch[];
}

export const COMPOSITE_FONTS: Record<string, CompositeFontSpec> = {
  "tinglet-script:400": {
    base: "pacifico:400",
    patches: [
      { char: "A", donor: "damion:400" },
      { char: "J", donor: "lobster:400" },
    ],
  },
};

const SCALE_REFERENCE = "D";
const COORDS: string[] = ["x", "y", "x1", "y1", "x2", "y2"];

function capHeight(font: opentype.Font): number {
  return font.charToGlyph(SCALE_REFERENCE).getBoundingBox().y2;
}

function scaled(path: opentype.Path, factor: number): opentype.Path {
  const out: opentype.Path = new opentype.Path();
  for (const command of path.commands) {
    const copy: Record<string, unknown> = { ...command };
    for (const key of COORDS) {
      if (typeof copy[key] === "number") copy[key] = (copy[key] as number) * factor;
    }
    out.commands.push(copy as unknown as opentype.PathCommand);
  }
  return out;
}

export function applyPatch(base: opentype.Font, donor: opentype.Font, char: string): void {
  const factor: number = capHeight(base) / capHeight(donor);
  const source: opentype.Glyph = donor.charToGlyph(char);
  const target: opentype.Glyph = base.charToGlyph(char);
  target.path = scaled(source.path, factor);
  target.advanceWidth = (source.advanceWidth ?? 0) * factor;
}
