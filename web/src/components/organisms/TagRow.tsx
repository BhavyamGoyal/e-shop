"use client";

import { useState } from "react";
import type { TagPatch, TagRecord } from "@/server/types/admin.types";
import { Button, Input } from "../atoms";
import { TagImageCell } from "./TagImageCell";

export interface TagRowProps {
  tag: TagRecord;
  onUpdate: (patch: TagPatch) => Promise<boolean>;
  onDelete: () => void;
}

export function TagRow({ tag, onUpdate, onDelete }: TagRowProps) {
  const [editing, setEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(tag.name);

  const save = async (): Promise<void> => {
    if (await onUpdate({ name })) setEditing(false);
  };

  return (
    <tr className="border-t">
      <td className="px-4 py-2">
        {editing ? <Input value={name} onChange={(event) => setName(event.target.value)} className="h-8 w-56" autoFocus /> : tag.name}
      </td>
      <td className="px-4 py-2">
        <TagImageCell url={tag.icon} label="icon" onChange={(icon: string) => void onUpdate({ icon })} />
      </td>
      <td className="px-4 py-2">
        <TagImageCell url={tag.image} label="image" onChange={(image: string) => void onUpdate({ image })} />
      </td>
      <td className="px-4 py-2">
        <input
          type="checkbox"
          className="h-4 w-4 accent-primary"
          checked={tag.header}
          onChange={(event) => void onUpdate({ header: event.target.checked })}
          aria-label={`Show ${tag.name} in header`}
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="checkbox"
          className="h-4 w-4 accent-primary"
          checked={tag.collection}
          onChange={(event) => void onUpdate({ collection: event.target.checked })}
          aria-label={`Show ${tag.name} in collections`}
        />
      </td>
      <td className="px-4 py-2">{tag.productCount}</td>
      <td className="px-4 py-2">
        <div className="flex justify-end gap-2">
          {editing ? (
            <>
              <Button size="sm" disabled={!name.trim()} onClick={() => void save()}>
                Save
              </Button>
              <Button size="sm" variant="outline" tone="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" tone="secondary" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button size="sm" variant="outline" tone="danger" onClick={onDelete}>
                Delete
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
