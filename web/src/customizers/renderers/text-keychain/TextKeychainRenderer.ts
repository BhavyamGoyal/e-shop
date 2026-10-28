import type { Font } from "opentype.js";
import type { ParamValues } from "../../core";
import type { ICustomizerRenderer, IModelExporter, RenderResult } from "../../rendering/ICustomizerRenderer";
import type { IFontProvider } from "./FontProvider";
import type { KeychainModel, KeychainModelBuilder } from "./KeychainModelBuilder";
import { toKeychainParams } from "./keychain-params";
import type { KeychainParams } from "./geometry/types";
import type { ThreeSceneAdapter } from "./ThreeSceneAdapter";

export class TextKeychainRenderer implements ICustomizerRenderer {
  private generation = 0;

  constructor(
    private readonly scene: ThreeSceneAdapter,
    private readonly models: KeychainModelBuilder,
    private readonly fonts: IFontProvider,
    readonly exporter: IModelExporter,
  ) {}

  mount(container: HTMLElement): void {
    this.scene.mount(container);
  }

  async update(params: ParamValues): Promise<RenderResult | null> {
    const ticket: number = ++this.generation;
    const keychain: KeychainParams = toKeychainParams(params);
    let font: Font;
    try {
      font = await this.fonts.load(keychain.font);
    } catch (error: unknown) {
      return this.failure(error instanceof Error ? error.message : "Could not load font");
    }
    if (ticket !== this.generation) return null;
    try {
      return this.present(this.models.build(font, keychain));
    } catch (error: unknown) {
      return this.failure(error instanceof Error ? error.message : "Build failed");
    }
  }

  resetView(): void {
    this.scene.frame();
  }

  dispose(): void {
    this.generation++;
    this.scene.dispose();
  }

  private present(model: KeychainModel): RenderResult {
    this.scene.setParts(model.parts);
    if (!model.parts.length) return { ok: true, message: "Type some text to see your design.", stats: [] };
    const size = this.scene.size();
    const stats: string[] = [];
    if (size) stats.push(`Size: ${size.x.toFixed(1)} × ${size.y.toFixed(1)} × ${size.z.toFixed(1)} mm`);
    stats.push(`Triangles: ${model.triangles.toLocaleString()}`);
    stats.push(model.watertight ? "Watertight: ready to print" : "Mesh has open edges");
    return { ok: true, message: "", stats };
  }

  private failure(message: string): RenderResult {
    return { ok: false, message, stats: [] };
  }
}
