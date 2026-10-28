declare module "clipper-lib" {
  interface IntPoint {
    X: number;
    Y: number;
  }

  type Path = IntPoint[];
  type Paths = Path[];

  interface PolyNode {
    Childs(): PolyNode[];
    IsHole(): boolean;
    Contour(): Path;
  }

  interface ClipperInstance {
    StrictlySimple: boolean;
    AddPaths(paths: Paths, polyType: number, closed: boolean): boolean;
    Execute(clipType: number, solution: Paths | PolyNode, subjectFill: number, clipFill: number): boolean;
  }

  interface ClipperOffsetInstance {
    AddPaths(paths: Paths, joinType: number, endType: number): void;
    Execute(solution: Paths, delta: number): void;
  }

  interface ClipperLibStatic {
    Clipper: new () => ClipperInstance;
    ClipperOffset: new (miterLimit: number, arcTolerance: number) => ClipperOffsetInstance;
    Paths: new () => Paths;
    PolyTree: new () => PolyNode;
    PolyType: { ptSubject: number; ptClip: number };
    ClipType: { ctUnion: number; ctDifference: number };
    PolyFillType: { pftNonZero: number };
    JoinType: { jtRound: number };
    EndType: { etClosedPolygon: number };
  }

  const ClipperLib: ClipperLibStatic;
  export type { IntPoint, Path, Paths, PolyNode };
  export default ClipperLib;
}
