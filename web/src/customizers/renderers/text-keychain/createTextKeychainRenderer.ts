import type { ICustomizerRenderer } from "../../rendering/ICustomizerRenderer";
import { CdnFontProvider, type IFontProvider } from "./FontProvider";
import { KeychainModelBuilder } from "./KeychainModelBuilder";
import { TextKeychainRenderer } from "./TextKeychainRenderer";
import { ThreeMfExporter } from "./ThreeMfExporter";
import { ThreeSceneAdapter } from "./ThreeSceneAdapter";

const fonts: IFontProvider = new CdnFontProvider();

export function createTextKeychainRenderer(): ICustomizerRenderer {
  const models: KeychainModelBuilder = new KeychainModelBuilder();
  return new TextKeychainRenderer(new ThreeSceneAdapter(), models, fonts, new ThreeMfExporter(models, fonts));
}
