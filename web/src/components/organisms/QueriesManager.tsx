"use client";

import { useQueries } from "@/lib/use-queries";
import type { QueryRecord } from "@/server/types/contact.types";
import { Heading, Text } from "../atoms";
import { AlertMessage } from "../molecules";

export function QueriesManager() {
  const { queries, loading, error } = useQueries();

  return (
    <section className="flex flex-col gap-5">
      <div>
        <Heading level={2}>Queries</Heading>
        <Text tone="muted" className="text-sm">
          {queries.length} queries
        </Text>
      </div>
      {error ? <AlertMessage tone="danger" message={error} /> : null}
      {loading ? <Text tone="muted">Loading...</Text> : null}
      {!loading && !error && queries.length === 0 ? <Text tone="muted">No queries yet.</Text> : null}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Contact</th>
              <th className="px-4 py-2 font-medium">Message</th>
              <th className="px-4 py-2 font-medium">Account</th>
              <th className="px-4 py-2 font-medium">Received</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((query: QueryRecord) => (
              <tr key={query.id} className="border-t align-top">
                <td className="px-4 py-2">{query.name}</td>
                <td className="px-4 py-2">{query.contact}</td>
                <td className="max-w-md whitespace-pre-wrap px-4 py-2">{query.message}</td>
                <td className="px-4 py-2">{query.userName || "Guest"}</td>
                <td className="whitespace-nowrap px-4 py-2">{new Date(query.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
