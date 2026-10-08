"use client";

import { useRef, useState, type ChangeEvent } from "react";
import type { InsightKind } from "@/server/types/instagram.types";
import { Button, Text } from "../atoms";
import { Select } from "../atoms/Controls/Select";
import { Card } from "../molecules";

export interface InstagramImportProps {
  busy: boolean;
  apiConfigured: boolean;
  onUpload: (kind: InsightKind, file: File) => Promise<void>;
  onSync: () => Promise<void>;
}

const KIND_OPTIONS: { value: InsightKind; label: string }[] = [
  { value: "account", label: "Account metrics (one row per day)" },
  { value: "post", label: "Post performance (one row per post)" },
  { value: "audience", label: "Audience (dimension, label, value)" },
];

export function InstagramImport({ busy, apiConfigured, onUpload, onSync }: InstagramImportProps) {
  const [kind, setKind] = useState<InsightKind>("account");
  const input = useRef<HTMLInputElement>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file: File | undefined = event.target.files?.[0];
    if (file) await onUpload(kind, file);
    if (input.current) input.current.value = "";
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-64 flex-1 flex-col gap-1.5">
          <Text tone="muted" className="text-sm">
            File contents
          </Text>
          <Select
            value={kind}
            disabled={busy}
            options={KIND_OPTIONS}
            onChange={(event: ChangeEvent<HTMLSelectElement>): void => setKind(event.target.value as InsightKind)}
          />
        </div>
        <Button disabled={busy} onClick={(): void => input.current?.click()}>
          Upload CSV / JSON
        </Button>
        <Button variant="outline" disabled={busy || !apiConfigured} onClick={onSync}>
          Sync from Instagram
        </Button>
        <input ref={input} type="file" accept=".csv,.json" className="sr-only" onChange={handleFile} />
      </div>
      <Text tone="muted" className="text-xs">
        Re-uploading the same day or post updates it instead of duplicating it.
        {apiConfigured ? "" : " Sync is off until INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN are set."}
      </Text>
    </Card>
  );
}
