"use client";

import { useState, type FormEvent } from "react";
import { useTags } from "@/lib/use-tags";
import type { TagPatch, TagRecord } from "@/server/types/admin.types";
import { Button, Heading, Input, Text } from "../atoms";
import { AlertMessage } from "../molecules";
import { TagRow } from "./TagRow";

export function TagsManager() {
  const tags = useTags();
  const [newName, setNewName] = useState<string>("");

  const submitNew = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (await tags.create(newName)) setNewName("");
  };

  const confirmDelete = (tag: TagRecord): void => {
    if (window.confirm(`Delete tag "${tag.name}"? It will be removed from ${tag.productCount} product(s).`)) {
      void tags.remove(tag.id);
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <div>
        <Heading level={2}>Tags</Heading>
        <Text tone="muted" className="text-sm">
          {tags.tags.length} tags
        </Text>
      </div>
      <form onSubmit={(event) => void submitNew(event)} className="flex items-center gap-3">
        <Input placeholder="New tag name" value={newName} onChange={(event) => setNewName(event.target.value)} className="w-64" />
        <Button type="submit" disabled={!newName.trim()}>
          Add tag
        </Button>
      </form>
      {tags.error ? <AlertMessage tone="danger" message={tags.error} /> : null}
      {tags.loading ? <Text tone="muted">Loading...</Text> : null}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Icon</th>
              <th className="px-4 py-2 font-medium">Image</th>
              <th className="px-4 py-2 font-medium">Header</th>
              <th className="px-4 py-2 font-medium">Collection</th>
              <th className="px-4 py-2 font-medium">Products</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {tags.tags.map((tag: TagRecord) => (
              <TagRow
                key={`${tag.id}:${tag.name}`}
                tag={tag}
                onUpdate={(patch: TagPatch) => tags.update(tag.id, patch)}
                onDelete={() => confirmDelete(tag)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
