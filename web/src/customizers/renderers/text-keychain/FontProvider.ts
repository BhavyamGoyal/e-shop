import * as opentype from "opentype.js";

export interface IFontProvider {
  load(fontKey: string, signal?: AbortSignal): Promise<opentype.Font>;
}

const FONT_BASE = "https://cdn.jsdelivr.net/fontsource/fonts";

export class CdnFontProvider implements IFontProvider {
  private readonly cache: Map<string, opentype.Font> = new Map();

  async load(fontKey: string, signal?: AbortSignal): Promise<opentype.Font> {
    const cached: opentype.Font | undefined = this.cache.get(fontKey);
    if (cached) return cached;
    const response: Response = await fetch(this.urlFor(fontKey), { signal });
    if (!response.ok) throw new Error(`Could not load font (HTTP ${response.status})`);
    const font: opentype.Font = opentype.parse(await response.arrayBuffer());
    this.cache.set(fontKey, font);
    return font;
  }

  private urlFor(fontKey: string): string {
    const [id, weight] = fontKey.split(":");
    return `${FONT_BASE}/${encodeURIComponent(id)}@latest/latin-${encodeURIComponent(weight ?? "400")}-normal.woff`;
  }
}
