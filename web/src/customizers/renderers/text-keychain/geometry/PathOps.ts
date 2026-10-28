import ClipperLib, { type IntPoint, type Path, type Paths, type PolyNode } from "clipper-lib";
import type { Bounds, Contour, Point, Polygon } from "./types";

const SCALE = 1000;
const ARC_TOLERANCE = 10;
const MIN_POINTS = 3;
const EPSILON = 1e-6;

export class PathOps {
  toPaths(contours: Contour[]): Paths {
    return contours.map((contour: Contour): Path =>
      contour.map((p: Point): IntPoint => ({ X: Math.round(p[0] * SCALE), Y: Math.round(p[1] * SCALE) })),
    );
  }

  union(subject: Paths, clip?: Paths): Paths {
    return this.execute(ClipperLib.ClipType.ctUnion, subject, clip);
  }

  difference(subject: Paths, clip: Paths): Paths {
    return this.execute(ClipperLib.ClipType.ctDifference, subject, clip);
  }

  offset(paths: Paths, delta: number): Paths {
    if (Math.abs(delta) < EPSILON || !paths.length) return paths;
    const offsetter = new ClipperLib.ClipperOffset(2, ARC_TOLERANCE);
    offsetter.AddPaths(paths, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
    const solution: Paths = new ClipperLib.Paths();
    offsetter.Execute(solution, delta * SCALE);
    return solution;
  }

  closing(paths: Paths, amount: number): Paths {
    if (amount <= 0 || !paths.length) return paths;
    return this.union(this.offset(this.offset(paths, amount), -amount));
  }

  circle(cx: number, cy: number, radius: number): Path {
    const n: number = Math.max(48, Math.ceil(radius * 24));
    const path: Path = [];
    for (let i = 0; i < n; i++) {
      const angle: number = (i / n) * Math.PI * 2;
      path.push({
        X: Math.round((cx + radius * Math.cos(angle)) * SCALE),
        Y: Math.round((cy + radius * Math.sin(angle)) * SCALE),
      });
    }
    return path;
  }

  bounds(paths: Paths): Bounds {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const path of paths) {
      for (const p of path) {
        if (p.X < minX) minX = p.X;
        if (p.X > maxX) maxX = p.X;
        if (p.Y < minY) minY = p.Y;
        if (p.Y > maxY) maxY = p.Y;
      }
    }
    return { minX: minX / SCALE, maxX: maxX / SCALE, minY: minY / SCALE, maxY: maxY / SCALE };
  }

  toPolygons(paths: Paths): Polygon[] {
    if (!paths.length) return [];
    const clipper = new ClipperLib.Clipper();
    clipper.StrictlySimple = true;
    clipper.AddPaths(paths, ClipperLib.PolyType.ptSubject, true);
    const tree: PolyNode = new ClipperLib.PolyTree();
    clipper.Execute(
      ClipperLib.ClipType.ctUnion,
      tree,
      ClipperLib.PolyFillType.pftNonZero,
      ClipperLib.PolyFillType.pftNonZero,
    );
    const out: Polygon[] = [];
    this.walk(tree, out);
    return out;
  }

  private execute(type: number, subject: Paths, clip?: Paths): Paths {
    const clipper = new ClipperLib.Clipper();
    clipper.StrictlySimple = true;
    clipper.AddPaths(subject, ClipperLib.PolyType.ptSubject, true);
    if (clip) clipper.AddPaths(clip, ClipperLib.PolyType.ptClip, true);
    const solution: Paths = new ClipperLib.Paths();
    clipper.Execute(type, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
    return solution;
  }

  private signedArea(points: Contour): number {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const p: Point = points[i];
      const q: Point = points[(i + 1) % points.length];
      area += p[0] * q[1] - q[0] * p[1];
    }
    return area / 2;
  }

  private orient(points: Contour, counterClockwise: boolean): Contour {
    return this.signedArea(points) > 0 === counterClockwise ? points : points.slice().reverse();
  }

  private contourToPoints(contour: Path): Contour {
    let points: Contour = contour.map((p: IntPoint): Point => [p.X, p.Y]);
    let changed = true;
    while (changed && points.length >= MIN_POINTS) {
      changed = false;
      for (let i = 0; i < points.length; i++) {
        const prev: Point = points[(i + points.length - 1) % points.length];
        const cur: Point = points[i];
        const next: Point = points[(i + 1) % points.length];
        const duplicate: boolean = cur[0] === prev[0] && cur[1] === prev[1];
        const cross: number = (cur[0] - prev[0]) * (next[1] - cur[1]) - (cur[1] - prev[1]) * (next[0] - cur[0]);
        if (duplicate || cross === 0) {
          changed = true;
          points = points.slice(0, i).concat(points.slice(i + 1));
          break;
        }
      }
    }
    return points.map((q: Point): Point => [q[0] / SCALE, q[1] / SCALE]);
  }

  private walk(node: PolyNode, out: Polygon[]): void {
    for (const child of node.Childs()) {
      if (child.IsHole()) continue;
      const outer: Contour = this.contourToPoints(child.Contour());
      const holes: Contour[] = child.Childs().map((hole: PolyNode): Contour => this.contourToPoints(hole.Contour()));
      if (outer.length >= MIN_POINTS) {
        out.push({
          outer: this.orient(outer, true),
          holes: holes
            .filter((hole: Contour): boolean => hole.length >= MIN_POINTS)
            .map((hole: Contour): Contour => this.orient(hole, false)),
        });
      }
      for (const hole of child.Childs()) this.walk(hole, out);
    }
  }
}
