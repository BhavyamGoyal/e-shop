import type { ParamValues } from "../../core";
import type { IModelExporter } from "../../rendering/ICustomizerRenderer";
import type { ThreeMfWriter } from "../shared/ThreeMfWriter";
import type { IFontProvider } from "./FontProvider";
import type { KeychainModelBuilder } from "./KeychainModelBuilder";
import { toKeychainParams } from "./keychain-params";

export class ThreeMfExporter implements IModelExporter {
  readonly label: string = "Download 3MF";
  readonly extension: string = "3mf";

  constructor(
    private readonly models: KeychainModelBuilder,
    private readonly fonts: IFontProvider,
    private readonly writer: ThreeMfWriter,
  ) {}

  async export(params: ParamValues, fileName: string): Promise<Blob> {
    const keychain = toKeychainParams(params);
    const model = this.models.build(await this.fonts.load(keychain.font), keychain);
    if (!model.parts.length) throw new Error("Nothing to export");
    return this.writer.write(model.parts, fileName);
  }
}
