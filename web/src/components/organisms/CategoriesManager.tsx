"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCategories, updateCategory } from "@/lib/admin-api";
import type { CategoryPatch, CategoryRecord } from "@/server/types/admin.types";
import { Heading, Input, Text } from "../atoms";
import { AlertMessage } from "../molecules";
import { TagImageCell } from "./TagImageCell";

const message = (error: unknown): string => (error instanceof Error ? error.message : "Request failed");

export function CategoriesManager() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    try {
      setCategories(await fetchCategories());
      setError(null);
    } catch (reason: unknown) {
      setError(message(reason));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = async (id: string, patch: CategoryPatch): Promise<void> => {
    try {
      await updateCategory(id, patch);
      await load();
    } catch (reason: unknown) {
      setError(message(reason));
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <div>
        <Heading level={2}>Categories</Heading>
        <Text tone="muted" className="text-sm">
          {categories.length} categories
        </Text>
      </div>
      {error ? <AlertMessage tone="danger" message={error} /> : null}
      {loading ? <Text tone="muted">Loading...</Text> : null}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Slug</th>
              <th className="px-4 py-2 font-medium">Image</th>
              <th className="px-4 py-2 font-medium">Order</th>
              <th className="px-4 py-2 font-medium">On home</th>
              <th className="px-4 py-2 font-medium">Active</th>
              <th className="px-4 py-2 font-medium">Products</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category: CategoryRecord) => (
              <tr key={`${category.id}:${category.name}:${category.position}`} className="border-t">
                <td className="px-4 py-2">
                  <Input
                    defaultValue={category.name}
                    className="h-8 w-48"
                    onBlur={(event) => {
                      const name: string = event.target.value.trim();
                      if (name && name !== category.name) void update(category.id, { name });
                    }}
                  />
                </td>
                <td className="px-4 py-2">{category.slug}</td>
                <td className="px-4 py-2">
                  <TagImageCell url={category.image} label="image" onChange={(image: string) => void update(category.id, { image })} />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    defaultValue={category.position}
                    className="h-8 w-20"
                    onBlur={(event) => {
                      const position: number = Number(event.target.value);
                      if (Number.isFinite(position) && position !== category.position) void update(category.id, { position });
                    }}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={category.showOnHome}
                    onChange={(event) => void update(category.id, { showOnHome: event.target.checked })}
                    aria-label={`Show ${category.name} on home`}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={category.active}
                    onChange={(event) => void update(category.id, { active: event.target.checked })}
                    aria-label={`${category.name} active`}
                  />
                </td>
                <td className="px-4 py-2">{category.productCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
