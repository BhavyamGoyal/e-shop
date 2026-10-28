import { ShapeUtils, Vector2 } from "three";
import type { Contour, MeshData, MeshInfo, Point, Polygon } from "./types";

export class MeshBuilder {
  build(polys: Polygon[], z0: number, z1: number): MeshData {
    const positions: number[] = [];
    const indices: number[] = [];
    for (const poly of polys) {
      const rings: Contour[] = [poly.outer, ...poly.holes];
      const points: Point[] = rings.flat();
      const n: number = points.length;
      const base: number = positions.length / 3;
      for (const q of points) positions.push(q[0], q[1], z0);
      for (const q of points) positions.push(q[0], q[1], z1);
      const triangles: number[][] = ShapeUtils.triangulateShape(
        poly.outer.map((q: Point): Vector2 => new Vector2(q[0], q[1])),
        poly.holes.map((hole: Contour): Vector2[] => hole.map((q: Point): Vector2 => new Vector2(q[0], q[1]))),
      );
      for (const triangle of triangles) {
        const a: number = triangle[0];
        let b: number = triangle[1];
        let c: number = triangle[2];
        const area: number =
          (points[b][0] - points[a][0]) * (points[c][1] - points[a][1]) -
          (points[b][1] - points[a][1]) * (points[c][0] - points[a][0]);
        if (area < 0) {
          const swap: number = b;
          b = c;
          c = swap;
        }
        indices.push(base + n + a, base + n + b, base + n + c, base + a, base + c, base + b);
      }
      let start = 0;
      for (const ring of rings) {
        for (let k = 0; k < ring.length; k++) {
          const i: number = start + k;
          const j: number = start + ((k + 1) % ring.length);
          indices.push(base + i, base + j, base + n + j, base + i, base + n + j, base + n + i);
        }
        start += ring.length;
      }
    }
    return { positions, indices };
  }

  analyze(mesh: MeshData): MeshInfo {
    const canon: Map<string, number> = new Map();
    const ids: number[] = [];
    for (let i = 0; i < mesh.positions.length; i += 3) {
      const key: string = `${mesh.positions[i]},${mesh.positions[i + 1]},${mesh.positions[i + 2]}`;
      if (!canon.has(key)) canon.set(key, canon.size);
      ids.push(canon.get(key) as number);
    }
    const count: number = canon.size;
    const edges: Map<number, number> = new Map();
    for (let i = 0; i < mesh.indices.length; i += 3) {
      for (let k = 0; k < 3; k++) {
        const a: number = ids[mesh.indices[i + k]];
        const b: number = ids[mesh.indices[i + ((k + 1) % 3)]];
        const key: number = a * count + b;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    }
    let open = 0;
    let nonManifold = 0;
    for (const [key, value] of edges) {
      const a: number = Math.floor(key / count);
      const b: number = key % count;
      if (value > 1) nonManifold++;
      if (!edges.has(b * count + a)) open++;
    }
    return { open, nonManifold, triangles: mesh.indices.length / 3 };
  }
}
