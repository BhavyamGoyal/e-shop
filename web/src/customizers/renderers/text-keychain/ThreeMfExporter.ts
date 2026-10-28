import JSZip from "jszip";
import type { ParamValues } from "../../core";
import type { IModelExporter } from "../../rendering/ICustomizerRenderer";
import type { IFontProvider } from "./FontProvider";
import type { KeychainModelBuilder } from "./KeychainModelBuilder";
import { toKeychainParams } from "./keychain-params";
import type { Part } from "./geometry/types";

const CONTENT_TYPES =
  '<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
  '<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>';

const RELATIONSHIPS =
  '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>';

const MIME_TYPE = "application/vnd.ms-package.3dmanufacturing-3dmodel+xml";
const ESCAPES: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" };

const round = (value: number): string => String(Math.round(value * 10000) / 10000);
const escapeXml = (value: string): string => value.replace(/[<>&"]/g, (char: string): string => ESCAPES[char]);

export class ThreeMfExporter implements IModelExporter {
  readonly label: string = "Download 3MF";
  readonly extension: string = "3mf";

  constructor(
    private readonly models: KeychainModelBuilder,
    private readonly fonts: IFontProvider,
  ) {}

  async export(params: ParamValues, fileName: string): Promise<Blob> {
    const keychain = toKeychainParams(params);
    const model = this.models.build(await this.fonts.load(keychain.font), keychain);
    if (!model.parts.length) throw new Error("Nothing to export");
    const zip: JSZip = new JSZip();
    zip.file("[Content_Types].xml", CONTENT_TYPES);
    zip.file("_rels/.rels", RELATIONSHIPS);
    zip.file("3D/3dmodel.model", this.modelXml(model.parts, fileName));
    return zip.generateAsync({ type: "blob", mimeType: MIME_TYPE, compression: "DEFLATE" });
  }

  private modelXml(parts: Part[], title: string): string {
    const out: string[] = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">',
      `<metadata name="Title">${escapeXml(title)}</metadata>`,
      '<metadata name="Application">Tinglet Customizer</metadata>',
      "<resources>",
      '<basematerials id="1">',
      ...parts.map((part: Part): string => `<base name="${escapeXml(part.name)}" displaycolor="${part.color.toUpperCase()}FF"/>`),
      "</basematerials>",
      ...parts.map((part: Part, index: number): string => this.objectXml(part, index)),
      "</resources><build>",
      ...parts.map((_part: Part, index: number): string => `<item objectid="${index + 2}"/>`),
      "</build></model>",
    ];
    return out.join("\n");
  }

  private objectXml(part: Part, index: number): string {
    const vertices: string[] = [];
    for (let k = 0; k < part.positions.length; k += 3) {
      vertices.push(
        `<vertex x="${round(part.positions[k])}" y="${round(part.positions[k + 1])}" z="${round(part.positions[k + 2])}"/>`,
      );
    }
    const triangles: string[] = [];
    for (let k = 0; k < part.indices.length; k += 3) {
      triangles.push(`<triangle v1="${part.indices[k]}" v2="${part.indices[k + 1]}" v3="${part.indices[k + 2]}"/>`);
    }
    return (
      `<object id="${index + 2}" name="${escapeXml(part.name)}" type="model" pid="1" pindex="${index}">` +
      `<mesh><vertices>${vertices.join("")}</vertices><triangles>${triangles.join("")}</triangles></mesh></object>`
    );
  }
}
