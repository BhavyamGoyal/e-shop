import {
  Box3,
  BufferGeometry,
  CanvasTexture,
  Group,
  LineBasicMaterial,
  LineSegments,
  Object3D,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
} from "three";

interface AxisSpec {
  direction: Vector3;
  tick: Vector3;
  title: string;
  css: string;
  hex: number;
}

const AXES: AxisSpec[] = [
  { direction: new Vector3(1, 0, 0), tick: new Vector3(0, 0, 1), title: "Width", css: "#d93025", hex: 0xd93025 },
  { direction: new Vector3(0, 1, 0), tick: new Vector3(0, 0, 1), title: "Length", css: "#1e8e3e", hex: 0x1e8e3e },
  { direction: new Vector3(0, 0, 1), tick: new Vector3(-1, 0, 0), title: "Height", css: "#1a73e8", hex: 0x1a73e8 },
];

function niceStep(maxDim: number): number {
  if (maxDim > 600) return 50;
  if (maxDim > 300) return 20;
  if (maxDim > 120) return 10;
  if (maxDim > 50) return 5;
  return 2;
}

function labelSprite(text: string, position: Vector3, height: number, color: string): Sprite {
  const canvas: HTMLCanvasElement = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 64;
  const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.fillStyle = color;
  context.font = "bold 34px system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 192, 34);
  const texture: CanvasTexture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const sprite: Sprite = new Sprite(new SpriteMaterial({ map: texture, depthTest: false, transparent: true }));
  sprite.position.copy(position);
  sprite.scale.set(height * 6, height, 1);
  sprite.renderOrder = 10;
  return sprite;
}

function axisRuler(origin: Vector3, axis: AxisSpec, size: number, step: number): Object3D[] {
  const length: number = Math.ceil(size / step) * step;
  const points: Vector3[] = [origin.clone(), origin.clone().addScaledVector(axis.direction, length)];
  const indices: number[] = [0, 1];
  const labels: Object3D[] = [];
  const labelHeight: number = step * 0.9;
  for (let d = 0; d <= length + 1e-6; d += step) {
    const major: boolean = Math.round(d / step) % 2 === 0;
    const base: Vector3 = origin.clone().addScaledVector(axis.direction, d);
    const start: number = points.length;
    points.push(base, base.clone().addScaledVector(axis.tick, major ? step * 0.8 : step * 0.4));
    indices.push(start, start + 1);
    if (major) labels.push(labelSprite(String(Math.round(d)), base.clone().addScaledVector(axis.tick, step * 1.4), labelHeight, axis.css));
  }
  const geometry: BufferGeometry = new BufferGeometry().setFromPoints(points);
  geometry.setIndex(indices);
  const lines: LineSegments = new LineSegments(geometry, new LineBasicMaterial({ color: axis.hex, depthTest: false, transparent: true }));
  lines.renderOrder = 9;
  lines.frustumCulled = false;
  const title: string = `${axis.title} ${size.toFixed(1)} mm`;
  const titlePosition: Vector3 = origin.clone().addScaledVector(axis.direction, length + step * 3);
  return [lines, ...labels, labelSprite(title, titlePosition, labelHeight * 1.2, axis.css)];
}

export function buildRulers(box: Box3): Group {
  const group: Group = new Group();
  const size: Vector3 = box.getSize(new Vector3());
  const step: number = niceStep(Math.max(size.x, size.y, size.z));
  const origin: Vector3 = box.min.clone();
  const sizes: number[] = [size.x, size.y, size.z];
  AXES.forEach((axis: AxisSpec, index: number): void => {
    group.add(...axisRuler(origin, axis, sizes[index], step));
  });
  return group;
}

export function disposeRulers(group: Group): void {
  for (const child of [...group.children]) {
    group.remove(child);
    const target = child as Partial<LineSegments & Sprite>;
    target.geometry?.dispose();
    const material = target.material as (SpriteMaterial | LineBasicMaterial) | undefined;
    (material as SpriteMaterial | undefined)?.map?.dispose();
    material?.dispose();
  }
}
