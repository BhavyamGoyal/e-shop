import type { ParamValues } from "../../core";
import type { ICustomizerRenderer, IModelExporter, RenderResult } from "../../rendering/ICustomizerRenderer";
import type { KeychainModel } from "../text-keychain/KeychainModelBuilder";
import type { ThreeSceneAdapter } from "../text-keychain/ThreeSceneAdapter";

export abstract class ThreeModelRenderer implements ICustomizerRenderer {
  private generation = 0;

  constructor(
    private readonly scene: ThreeSceneAdapter,
    readonly exporter: IModelExporter,
    private readonly emptyMessage: string,
  ) {}

  protected abstract build(params: ParamValues): Promise<KeychainModel>;

  mount(container: HTMLElement): void {
    this.scene.mount(container);
  }

  async update(params: ParamValues): Promise<RenderResult | null> {
    const ticket: number = ++this.generation;
    let model: KeychainModel;
    try {
      model = await this.build(params);
    } catch (error: unknown) {
      return ticket === this.generation ? this.failure(error instanceof Error ? error.message : "Build failed") : null;
    }
    return ticket === this.generation ? this.present(model) : null;
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
    if (!model.parts.length) return { ok: true, message: this.emptyMessage, stats: [] };
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
