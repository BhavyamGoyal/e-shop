import {
  Box3,
  BufferGeometry,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  GridHelper,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Part } from "./geometry/types";

const BACKGROUND = 0xf1f3f5;
const MIN_FRAME_SIZE = 30;

export class ThreeSceneAdapter {
  private readonly scene: Scene = new Scene();
  private readonly camera: PerspectiveCamera = new PerspectiveCamera(40, 1, 0.1, 3000);
  private readonly group: Group = new Group();
  private renderer: WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private observer: ResizeObserver | null = null;
  private container: HTMLElement | null = null;
  private frameId = 0;
  private framed = false;

  constructor() {
    this.scene.background = new Color(BACKGROUND);
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(0, -90, 70);
    this.scene.add(new HemisphereLight(0xffffff, 0x8a94a0, 1.1));
    const sun: DirectionalLight = new DirectionalLight(0xffffff, 1.4);
    sun.position.set(40, -60, 90);
    this.scene.add(sun);
    const grid: GridHelper = new GridHelper(300, 30, 0xb8c0c8, 0xdde2e6);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -0.02;
    this.scene.add(grid);
    this.scene.add(this.group);
  }

  mount(container: HTMLElement): void {
    this.container = container;
    const renderer: WebGLRenderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    this.renderer = renderer;
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.observer = new ResizeObserver((): void => this.resize());
    this.observer.observe(container);
    this.resize();
    this.animate();
  }

  setParts(parts: Part[]): void {
    this.clear();
    for (const part of parts) {
      const geometry: BufferGeometry = new BufferGeometry();
      geometry.setAttribute("position", new Float32BufferAttribute(part.positions, 3));
      geometry.setIndex(part.indices);
      geometry.computeVertexNormals();
      const material: MeshStandardMaterial = new MeshStandardMaterial({
        color: part.color,
        flatShading: true,
        roughness: 0.55,
        metalness: 0.05,
      });
      this.group.add(new Mesh(geometry, material));
    }
    if (!this.framed && parts.length) {
      this.framed = true;
      this.frame();
    }
  }

  size(): Vector3 | null {
    const box: Box3 = new Box3().setFromObject(this.group);
    return box.isEmpty() ? null : box.getSize(new Vector3());
  }

  frame(): void {
    const box: Box3 = new Box3().setFromObject(this.group);
    if (box.isEmpty() || !this.controls) return;
    const size: Vector3 = box.getSize(new Vector3());
    const center: Vector3 = box.getCenter(new Vector3());
    const distance: number = Math.max(size.x, size.y * 1.5, MIN_FRAME_SIZE) * 1.5;
    this.controls.target.copy(center);
    this.camera.position.set(center.x, center.y - distance * 0.7, center.z + distance * 0.8);
    this.controls.update();
  }

  dispose(): void {
    cancelAnimationFrame(this.frameId);
    this.observer?.disconnect();
    this.controls?.dispose();
    this.clear();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
    this.renderer = null;
    this.controls = null;
    this.observer = null;
    this.container = null;
  }

  private clear(): void {
    while (this.group.children.length) {
      const mesh: Mesh = this.group.children.pop() as Mesh;
      mesh.geometry.dispose();
      (mesh.material as MeshStandardMaterial).dispose();
    }
  }

  private resize(): void {
    if (!this.renderer || !this.container) return;
    const width: number = this.container.clientWidth;
    const height: number = this.container.clientHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);
    this.controls?.update();
    if (this.renderer) this.renderer.render(this.scene, this.camera);
  };
}
