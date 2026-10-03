import { AuthForm, type AuthMode } from "../organisms";

export interface AuthTemplateProps {
  mode: AuthMode;
  next: string;
}

export function AuthTemplate({ mode, next }: AuthTemplateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <AuthForm mode={mode} next={next} />
    </main>
  );
}
