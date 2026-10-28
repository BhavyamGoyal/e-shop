"use client";

import { useState, type FormEvent } from "react";
import { RendererHost } from "@/customizers/components/RendererHost";
import { paramResolver, type ParamDefinition } from "@/customizers/core";
import { rendererRegistry } from "@/customizers/renderers";
import type { CustomizerInput } from "@/server/types/customizer.types";
import { Button, Label, Textarea } from "../atoms";
import { Select } from "../atoms/Controls/Select";
import { CheckField, FormField } from "../molecules";
import { ParamBuilder } from "./ParamBuilder";

export interface CustomizerFormProps {
  formId: string;
  initial: CustomizerInput;
  submitLabel: string;
  onSubmit: (input: CustomizerInput) => Promise<boolean>;
  onCancel?: () => void;
  error?: string | null;
}

type Mode = "builder" | "json";

const RENDERER_OPTIONS = rendererRegistry.keys().map((key: string) => ({ value: key, label: key }));

export function CustomizerForm({ formId, initial, submitLabel, onSubmit, onCancel, error }: CustomizerFormProps) {
  const [input, setInput] = useState<CustomizerInput>(initial);
  const [mode, setMode] = useState<Mode>("builder");
  const [json, setJson] = useState<string>("");
  const [jsonError, setJsonError] = useState<string>("");
  const [preview, setPreview] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);

  const change = (patch: Partial<CustomizerInput>): void =>
    setInput((current: CustomizerInput): CustomizerInput => ({ ...current, ...patch }));

  const openJson = (): void => {
    setJson(JSON.stringify(input.params, null, 2));
    setJsonError("");
    setMode("json");
  };

  const applyJson = (): boolean => {
    try {
      const parsed: unknown = JSON.parse(json);
      if (!Array.isArray(parsed)) throw new Error("Params must be a JSON array");
      change({ params: parsed as ParamDefinition[] });
      setJsonError("");
      return true;
    } catch (error: unknown) {
      setJsonError(error instanceof Error ? error.message : "Invalid JSON");
      return false;
    }
  };

  const openBuilder = (): void => {
    if (mode === "json" && !applyJson()) return;
    setMode("builder");
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (mode === "json" && !applyJson()) return;
    setBusy(true);
    await onSubmit(input);
    setBusy(false);
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4 rounded-md border p-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id={`${formId}-title`} label="Title" required value={input.title} onChange={(e) => change({ title: e.target.value })} />
        <FormField
          id={`${formId}-slug`}
          label="Slug"
          hint={`/customize/${input.slug || "..."}`}
          value={input.slug}
          onChange={(e) => change({ slug: e.target.value })}
        />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${formId}-renderer`}>Renderer</Label>
          <Select
            id={`${formId}-renderer`}
            options={RENDERER_OPTIONS}
            value={input.renderer}
            onChange={(e) => change({ renderer: e.target.value })}
          />
        </div>
      </div>
      <CheckField label="Active" checked={input.active} onChange={(e) => change({ active: e.target.checked })} />
      <div className="flex gap-2">
        <Button size="sm" variant={mode === "builder" ? "solid" : "outline"} tone="secondary" onClick={openBuilder}>
          Builder
        </Button>
        <Button size="sm" variant={mode === "json" ? "solid" : "outline"} tone="secondary" onClick={openJson}>
          JSON
        </Button>
      </div>
      {mode === "builder" ? (
        <ParamBuilder params={input.params} onChange={(params: ParamDefinition[]) => change({ params })} />
      ) : (
        <div className="flex flex-col gap-2">
          <Textarea className="min-h-96 font-mono text-xs" value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} />
          {jsonError ? <p className="text-sm text-danger">{jsonError}</p> : null}
        </div>
      )}
      <div className="flex flex-col gap-3">
        <div>
          <Button size="sm" variant="outline" tone="secondary" onClick={() => setPreview((value: boolean) => !value)}>
            {preview ? "Hide preview" : "Show preview with default values"}
          </Button>
        </div>
        {preview ? <RendererHost rendererKey={input.renderer} params={paramResolver.defaults(input.params)} /> : null}
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy || !input.title.trim()}>
          {busy ? "Saving..." : submitLabel}
        </Button>
        {onCancel ? (
          <Button variant="outline" tone="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
