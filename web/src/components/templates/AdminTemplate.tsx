import type { ReactNode } from "react";
import { AdminNav } from "../organisms";

export interface AdminTemplateProps {
  email: string;
  readOnly?: boolean;
  children: ReactNode;
}

export function AdminTemplate({ email, readOnly = false, children }: AdminTemplateProps) {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <AdminNav email={email} />
      {readOnly ? (
        <p className="bg-muted px-6 py-2 text-center text-sm text-muted-foreground">
          Manager access: view only. Editing is disabled.
        </p>
      ) : null}
      <main className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
        <fieldset disabled={readOnly} className="contents">
          {children}
        </fieldset>
      </main>
    </div>
  );
}
