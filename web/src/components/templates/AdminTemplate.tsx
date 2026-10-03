import type { ReactNode } from "react";
import { AdminNav } from "../organisms";

export interface AdminTemplateProps {
  email: string;
  children: ReactNode;
}

export function AdminTemplate({ email, children }: AdminTemplateProps) {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <AdminNav email={email} />
      <main className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
