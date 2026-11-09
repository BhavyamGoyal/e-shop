import type { ParamValues } from "../../core";
import type { IModelExporter } from "../../rendering/ICustomizerRenderer";
import { ThreeModelRenderer } from "../shared/ThreeModelRenderer";
import type { IFontProvider } from "./FontProvider";
import type { KeychainModel, KeychainModelBuilder } from "./KeychainModelBuilder";
import { toKeychainParams } from "./keychain-params";
import type { KeychainParams } from "./geometry/types";
import type { ThreeSceneAdapter } from "./ThreeSceneAdapter";

export class TextKeychainRenderer extends ThreeModelRenderer {
  constructor(
    scene: ThreeSceneAdapter,
    private readonly models: KeychainModelBuilder,
    private readonly fonts: IFontProvider,
    exporter: IModelExporter,
  ) {
    super(scene, exporter, "Type some text to see your design.");
  }

  protected async build(params: ParamValues): Promise<KeychainModel> {
    const keychain: KeychainParams = toKeychainParams(params);
    return this.models.build(await this.fonts.load(keychain.font), keychain);
  }
}
