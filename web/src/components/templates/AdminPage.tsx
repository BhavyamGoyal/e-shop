import type { ReactNode } from "react";

export function AdminPage({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">{children}</div>;
}
