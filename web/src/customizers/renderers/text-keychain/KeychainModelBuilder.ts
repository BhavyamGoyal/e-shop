import type { Font } from "opentype.js";
import { KeychainGeometry } from "./geometry/KeychainGeometry";
import { MeshBuilder } from "./geometry/MeshBuilder";
import type { KeychainParams, Layer, MeshData, MeshInfo, Part } from "./geometry/types";

export interface KeychainModel {
  parts: Part[];
  triangles: number;
  watertight: boolean;
}

export class KeychainModelBuilder {
  constructor(
    private readonly geometry: KeychainGeometry = new KeychainGeometry(),
    private readonly meshes: MeshBuilder = new MeshBuilder(),
  ) {}

  build(font: Font, params: KeychainParams): KeychainModel {
    const parts: Part[] = [];
    let triangles = 0;
    let watertight = true;
    for (const layer of this.geometry.build(font, params)) {
      const mesh: MeshData = this.meshes.build(layer.polys, layer.z0, layer.z1);
      const info: MeshInfo = this.meshes.analyze(mesh);
      if (info.open || info.nonManifold) watertight = false;
      triangles += info.triangles;
      parts.push({ name: layer.name, color: this.colorFor(layer, params), ...mesh });
    }
    return { parts, triangles, watertight };
  }

  private colorFor(layer: Layer, params: KeychainParams): string {
    return layer.name === "Base" ? params.baseColor : params.textColor;
  }
}
