import * as opentype from "opentype.js";
import { applyPatch, COMPOSITE_FONTS, type CompositeFontSpec } from "./CompositeFont";

export interface IFontProvider {
  load(fontKey: string, signal?: AbortSignal): Promise<opentype.Font>;
}

const FONT_BASE = "https://cdn.jsdelivr.net/fontsource/fonts";

export class CdnFontProvider implements IFontProvider {
  private readonly cache: Map<string, opentype.Font> = new Map();

  async load(fontKey: string, signal?: AbortSignal): Promise<opentype.Font> {
    const cached: opentype.Font | undefined = this.cache.get(fontKey);
    if (cached) return cached;
    const spec: CompositeFontSpec | undefined = COMPOSITE_FONTS[fontKey];
    const font: opentype.Font = spec ? await this.compose(spec, signal) : await this.fetchFont(fontKey, signal);
    this.cache.set(fontKey, font);
    return font;
  }

  private async compose(spec: CompositeFontSpec, signal?: AbortSignal): Promise<opentype.Font> {
    const base: opentype.Font = await this.fetchFont(spec.base, signal);
    for (const patch of spec.patches) {
      applyPatch(base, await this.fetchFont(patch.donor, signal), patch.char);
    }
    return base;
  }

  private async fetchFont(fontKey: string, signal?: AbortSignal): Promise<opentype.Font> {
    const response: Response = await fetch(this.urlFor(fontKey), { signal });
    if (!response.ok) throw new Error(`Could not load font (HTTP ${response.status})`);
    return opentype.parse(await response.arrayBuffer());
  }

  private urlFor(fontKey: string): string {
    const [id, weight] = fontKey.split(":");
    return `${FONT_BASE}/${encodeURIComponent(id)}@latest/latin-${encodeURIComponent(weight ?? "400")}-normal.woff`;
  }
}
