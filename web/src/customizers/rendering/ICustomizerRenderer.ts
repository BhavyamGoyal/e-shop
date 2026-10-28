import type { ParamValues } from "../core";

export interface RenderResult {
  ok: boolean;
  message: string;
  stats: string[];
}

export interface IModelExporter {
  readonly label: string;
  readonly extension: string;
  export(params: ParamValues, fileName: string): Promise<Blob>;
}

export interface ICustomizerRenderer {
  readonly exporter: IModelExporter | null;
  mount(container: HTMLElement): void;
  update(params: ParamValues): Promise<RenderResult | null>;
  resetView(): void;
  dispose(): void;
}
