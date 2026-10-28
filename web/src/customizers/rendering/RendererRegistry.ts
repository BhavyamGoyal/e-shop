import type { ICustomizerRenderer } from "./ICustomizerRenderer";

export type RendererFactory = () => Promise<ICustomizerRenderer>;

export class RendererRegistry {
  private readonly factories: Map<string, RendererFactory> = new Map();

  register(key: string, factory: RendererFactory): this {
    this.factories.set(key, factory);
    return this;
  }

  has(key: string): boolean {
    return this.factories.has(key);
  }

  keys(): string[] {
    return [...this.factories.keys()];
  }

  create(key: string): Promise<ICustomizerRenderer> {
    const factory: RendererFactory | undefined = this.factories.get(key);
    if (!factory) return Promise.reject(new Error(`Unknown renderer "${key}"`));
    return factory();
  }
}
