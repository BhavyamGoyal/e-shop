import type { Font } from "opentype.js";
import { MeshBuilder } from "../text-keychain/geometry/MeshBuilder";
import type { Layer, MeshData, MeshInfo, Part } from "../text-keychain/geometry/types";
import type { KeychainModel } from "../text-keychain/KeychainModelBuilder";
import { LetterNameGeometry } from "./LetterNameGeometry";
import type { LetterNameParams } from "./letter-types";

export class LetterNameModelBuilder {
  constructor(
    private readonly geometry: LetterNameGeometry = new LetterNameGeometry(),
    private readonly meshes: MeshBuilder = new MeshBuilder(),
  ) {}

  build(letterFont: Font, nameFont: Font, params: LetterNameParams): KeychainModel {
    const parts: Part[] = [];
    let triangles = 0;
    let watertight = true;
    for (const layer of this.geometry.build(letterFont, nameFont, params)) {
      const mesh: MeshData = this.meshes.build(layer.polys, layer.z0, layer.z1);
      const info: MeshInfo = this.meshes.analyze(mesh);
      if (info.open || info.nonManifold) watertight = false;
      triangles += info.triangles;
      parts.push({ name: layer.name, color: this.colorFor(layer, params), ...mesh });
    }
    return { parts, triangles, watertight };
  }

  private colorFor(layer: Layer, params: LetterNameParams): string {
    return layer.name === "Name" ? params.nameColor : params.letterColor;
  }
}
