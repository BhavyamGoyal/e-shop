import type { ReactNode } from "react";
import { Header } from "../organisms";

interface PageTemplateProps {
  title: string;
  children: ReactNode;
}

export function PageTemplate({ title, children }: PageTemplateProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header title={title} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
