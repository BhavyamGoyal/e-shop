import type { Font } from "opentype.js";
import type { ParamValues } from "../../core";
import type { IModelExporter } from "../../rendering/ICustomizerRenderer";
import type { ThreeMfWriter } from "../shared/ThreeMfWriter";
import type { IFontProvider } from "../text-keychain/FontProvider";
import type { Part } from "../text-keychain/geometry/types";
import type { LetterNameModelBuilder } from "./LetterNameModelBuilder";
import { toLetterNameParams } from "./letter-params";
import type { LetterNameParams } from "./letter-types";

export class LetterNameExporter implements IModelExporter {
  readonly label: string = "Download 3MF";
  readonly extension: string = "3mf";
  readonly parts: readonly string[] = ["Letter", "Name"];

  constructor(
    private readonly models: LetterNameModelBuilder,
    private readonly fonts: IFontProvider,
    private readonly writer: ThreeMfWriter,
  ) {}

  async export(params: ParamValues, fileName: string, part?: string): Promise<Blob> {
    const design: LetterNameParams = toLetterNameParams(params);
    const [letterFont, nameFont]: Font[] = await Promise.all([
      this.fonts.load(design.letterFont),
      this.fonts.load(design.nameFont),
    ]);
    const all: Part[] = this.models.build(letterFont, nameFont, design).parts;
    const selected: Part[] = part ? all.filter((item: Part): boolean => item.name === part) : all;
    if (!selected.length) throw new Error("Nothing to export");
    return this.writer.write(selected, part ? `${fileName}-${part.toLowerCase()}` : fileName);
  }
}
