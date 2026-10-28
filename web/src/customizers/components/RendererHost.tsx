"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms";
import type { ParamValues } from "../core";
import type { ICustomizerRenderer, RenderResult } from "../rendering/ICustomizerRenderer";
import { downloadBlob } from "../rendering/downloadBlob";
import { rendererRegistry } from "../renderers";

const UPDATE_DEBOUNCE_MS = 120;

interface RendererHostProps {
  rendererKey: string;
  params: ParamValues;
  downloadName?: string;
  heightClass?: string;
}

export function RendererHost({ rendererKey, params, downloadName, heightClass = "h-[420px] md:h-[560px]" }: RendererHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderer, setRenderer] = useState<ICustomizerRenderer | null>(null);
  const [result, setResult] = useState<RenderResult | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    let created: ICustomizerRenderer | null = null;
    rendererRegistry
      .create(rendererKey)
      .then((instance: ICustomizerRenderer): void => {
        if (cancelled || !containerRef.current) return;
        created = instance;
        instance.mount(containerRef.current);
        setRenderer(instance);
      })
      .catch((error: unknown): void => {
        if (!cancelled) setResult({ ok: false, message: error instanceof Error ? error.message : "Failed to load", stats: [] });
      });
    return (): void => {
      cancelled = true;
      created?.dispose();
      setRenderer(null);
    };
  }, [rendererKey]);

  useEffect(() => {
    if (!renderer) return;
    const timer: number = window.setTimeout((): void => {
      void renderer.update(params).then((next: RenderResult | null): void => {
        if (next) setResult(next);
      });
    }, UPDATE_DEBOUNCE_MS);
    return (): void => window.clearTimeout(timer);
  }, [renderer, params]);

  const exporter = renderer?.exporter ?? null;
  const ready: boolean = renderer !== null;

  const download = async (): Promise<void> => {
    if (!exporter || !downloadName) return;
    setExporting(true);
    try {
      downloadBlob(await exporter.export(params, downloadName), `${downloadName}.${exporter.extension}`);
    } catch (error: unknown) {
      setResult({ ok: false, message: error instanceof Error ? error.message : "Export failed", stats: [] });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className={`relative w-full overflow-hidden rounded-2xl border border-border bg-muted ${heightClass}`}>
        <div ref={containerRef} className="absolute inset-0" />
        {!ready && !result && (
          <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Loading 3D preview…</p>
        )}
        <button
          type="button"
          onClick={(): void => renderer?.resetView()}
          className="absolute top-3 right-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-foreground shadow"
        >
          Reset view
        </button>
      </div>
      {result && !result.ok && <p className="text-sm text-danger">{result.message}</p>}
      {result && result.ok && result.message && <p className="text-sm text-muted-foreground">{result.message}</p>}
      {result && result.stats.length > 0 && (
        <ul className="text-xs text-muted-foreground">
          {result.stats.map((line: string) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {exporter && downloadName && (
        <Button onClick={download} disabled={exporting || !ready}>
          {exporting ? "Preparing…" : exporter.label}
        </Button>
      )}
    </div>
  );
}
