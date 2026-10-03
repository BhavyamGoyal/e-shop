"use client";

import { useState, type FormEvent } from "react";
import { useTags } from "@/lib/use-tags";
import type { TagRecord } from "@/server/types/admin.types";
import { Button, Heading, Input, Text } from "../atoms";
import { AlertMessage } from "../molecules";

export function TagsManager() {
  const tags = useTags();
  const [newName, setNewName] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");

  const submitNew = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (await tags.create(newName)) setNewName("");
  };

  const startEdit = (tag: TagRecord): void => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const saveEdit = async (tag: TagRecord): Promise<void> => {
    if (await tags.rename(tag.id, editName)) setEditingId(null);
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
              <th className="px-4 py-2 font-medium">Products</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {tags.tags.map((tag: TagRecord) => (
              <tr key={tag.id} className="border-t">
                <td className="px-4 py-2">
                  {editingId === tag.id ? (
                    <Input value={editName} onChange={(event) => setEditName(event.target.value)} className="h-8 w-64" autoFocus />
                  ) : (
                    tag.name
                  )}
                </td>
                <td className="px-4 py-2">{tag.productCount}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    {editingId === tag.id ? (
                      <>
                        <Button size="sm" disabled={!editName.trim()} onClick={() => void saveEdit(tag)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" tone="secondary" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" tone="secondary" onClick={() => startEdit(tag)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" tone="danger" onClick={() => confirmDelete(tag)}>
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
