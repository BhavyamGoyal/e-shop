import type { Font } from "opentype.js";
import type { ParamValues } from "../../core";
import type { IModelExporter } from "../../rendering/ICustomizerRenderer";
import { ThreeModelRenderer } from "../shared/ThreeModelRenderer";
import type { IFontProvider } from "../text-keychain/FontProvider";
import type { KeychainModel } from "../text-keychain/KeychainModelBuilder";
import type { ThreeSceneAdapter } from "../text-keychain/ThreeSceneAdapter";
import type { LetterNameModelBuilder } from "./LetterNameModelBuilder";
import { toLetterNameParams } from "./letter-params";
import type { LetterNameParams } from "./letter-types";

export class LetterNameRenderer extends ThreeModelRenderer {
  constructor(
    scene: ThreeSceneAdapter,
    private readonly models: LetterNameModelBuilder,
    private readonly fonts: IFontProvider,
    exporter: IModelExporter,
  ) {
    super(scene, exporter, "Type a letter and a name to see your design.");
  }

  protected async build(params: ParamValues): Promise<KeychainModel> {
    const design: LetterNameParams = toLetterNameParams(params);
    const [letterFont, nameFont]: Font[] = await Promise.all([
      this.fonts.load(design.letterFont),
      this.fonts.load(design.nameFont),
    ]);
    return this.models.build(letterFont, nameFont, design);
  }
}
