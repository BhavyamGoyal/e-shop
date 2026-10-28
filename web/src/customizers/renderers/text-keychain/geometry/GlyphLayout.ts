import type { Font, Glyph, PathCommand } from "opentype.js";
import type { Align, Contour, ContourGroup, Point } from "./types";

const BEZIER_STEPS = 10;
const BEND_SEGMENT = 0.4;
const MIN_POINTS = 3;

export interface LayoutOptions {
  size: number;
  spacing: number;
  lineHeight: number;
  align: Align;
}

export interface LaidText {
  groups: ContourGroup[];
  width: number;
}

interface Row {
  groups: ContourGroup[];
  width: number;
}

export class GlyphLayout {
  layout(font: Font, text: string, options: LayoutOptions): LaidText {
    const scale: number = options.size / font.unitsPerEm;
    const rows: Row[] = text.split("\n").map((line: string): Row => this.layoutRow(font, line, options, scale));
    const maxWidth: number = Math.max(0, ...rows.map((row: Row): number => row.width));
    const groups: ContourGroup[] = [];
    rows.forEach((row: Row, lineIndex: number): void => {
      const dx: number = this.offsetX(options.align, row.width, maxWidth);
      const dy: number = -lineIndex * options.size * options.lineHeight;
      for (const group of row.groups) {
        groups.push(group.map((contour: Contour): Contour => contour.map((p: Point): Point => [p[0] + dx, p[1] + dy])));
      }
    });
    return { groups, width: maxWidth };
  }

  bend(contours: ContourGroup, width: number, angleDeg: number): ContourGroup {
    if (Math.abs(angleDeg) < 0.5 || width <= 0) return contours;
    const radius: number = width / ((angleDeg * Math.PI) / 180);
    return contours.map((contour: Contour): Contour =>
      this.densify(contour, BEND_SEGMENT).map((p: Point): Point => {
        const theta: number = p[0] / radius;
        const r: number = radius + p[1];
        return [r * Math.sin(theta), r * Math.cos(theta) - radius];
      }),
    );
  }

  center(groups: ContourGroup[]): ContourGroup[] {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const group of groups) {
      for (const contour of group) {
        for (const p of contour) {
          if (p[0] < minX) minX = p[0];
          if (p[0] > maxX) maxX = p[0];
          if (p[1] < minY) minY = p[1];
          if (p[1] > maxY) maxY = p[1];
        }
      }
    }
    if (!isFinite(minX)) return groups;
    const cx: number = (minX + maxX) / 2;
    const cy: number = (minY + maxY) / 2;
    return groups.map((group: ContourGroup): ContourGroup =>
      group.map((contour: Contour): Contour => contour.map((p: Point): Point => [p[0] - cx, p[1] - cy])),
    );
  }

  private layoutRow(font: Font, line: string, options: LayoutOptions, scale: number): Row {
    const glyphs: Glyph[] = font.stringToGlyphs(line);
    const groups: ContourGroup[] = [];
    let x = 0;
    glyphs.forEach((glyph: Glyph, index: number): void => {
      const flat: ContourGroup = this.flatten(glyph.getPath(x, 0, options.size).commands);
      if (flat.length) groups.push(flat);
      x += (glyph.advanceWidth ?? 0) * scale + options.spacing;
      if (index < glyphs.length - 1) x += font.getKerningValue(glyph, glyphs[index + 1]) * scale;
    });
    return { groups, width: glyphs.length ? Math.max(0, x - options.spacing) : 0 };
  }

  private offsetX(align: Align, rowWidth: number, maxWidth: number): number {
    if (align === "left") return -maxWidth / 2;
    if (align === "right") return maxWidth / 2 - rowWidth;
    return -rowWidth / 2;
  }

  private flatten(commands: PathCommand[]): ContourGroup {
    const contours: ContourGroup = [];
    let current: Contour | null = null;
    let cx = 0;
    let cy = 0;
    for (const c of commands) {
      if (c.type === "M") {
        current = [[c.x, -c.y]];
        contours.push(current);
        cx = c.x;
        cy = c.y;
      } else if (!current) {
        continue;
      } else if (c.type === "L") {
        current.push([c.x, -c.y]);
        cx = c.x;
        cy = c.y;
      } else if (c.type === "Q") {
        for (let i = 1; i <= BEZIER_STEPS; i++) {
          const t: number = i / BEZIER_STEPS;
          const u: number = 1 - t;
          current.push([
            u * u * cx + 2 * u * t * c.x1 + t * t * c.x,
            -(u * u * cy + 2 * u * t * c.y1 + t * t * c.y),
          ]);
        }
        cx = c.x;
        cy = c.y;
      } else if (c.type === "C") {
        for (let i = 1; i <= BEZIER_STEPS; i++) {
          const t: number = i / BEZIER_STEPS;
          const u: number = 1 - t;
          current.push([
            u * u * u * cx + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x,
            -(u * u * u * cy + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t * t * t * c.y),
          ]);
        }
        cx = c.x;
        cy = c.y;
      } else if (c.type === "Z") {
        current = null;
      }
    }
    return contours.filter((contour: Contour): boolean => contour.length >= MIN_POINTS);
  }

  private densify(contour: Contour, maxSegment: number): Contour {
    const out: Contour = [];
    const n: number = contour.length;
    for (let i = 0; i < n; i++) {
      const a: Point = contour[i];
      const b: Point = contour[(i + 1) % n];
      out.push(a);
      const k: number = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / maxSegment);
      for (let j = 1; j < k; j++) {
        const t: number = j / k;
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    return out;
  }
}
