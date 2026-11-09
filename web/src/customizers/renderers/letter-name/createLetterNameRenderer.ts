import type { ICustomizerRenderer } from "../../rendering/ICustomizerRenderer";
import { ThreeMfWriter } from "../shared/ThreeMfWriter";
import { CdnFontProvider, type IFontProvider } from "../text-keychain/FontProvider";
import { ThreeSceneAdapter } from "../text-keychain/ThreeSceneAdapter";
import { LetterNameExporter } from "./LetterNameExporter";
import { LetterNameModelBuilder } from "./LetterNameModelBuilder";
import { LetterNameRenderer } from "./LetterNameRenderer";

const fonts: IFontProvider = new CdnFontProvider();

export function createLetterNameRenderer(): ICustomizerRenderer {
  const models: LetterNameModelBuilder = new LetterNameModelBuilder();
  return new LetterNameRenderer(new ThreeSceneAdapter(), models, fonts, new LetterNameExporter(models, fonts, new ThreeMfWriter()));
}
