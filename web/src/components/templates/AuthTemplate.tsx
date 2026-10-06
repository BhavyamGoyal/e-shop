import { AuthForm, type AuthMode } from "../organisms";

export interface AuthTemplateProps {
  mode: AuthMode;
  next: string;
}

export function AuthTemplate({ mode, next }: AuthTemplateProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <picture className="absolute inset-0 -z-0 block">
        <source media="(max-width: 767px)" srcSet="/auth-bg-mobile.jpg" />
        <img src="/auth-bg.jpg" alt="" className="size-full object-cover object-center" />
      </picture>
      <div className="relative z-10 flex w-full justify-center">
        <AuthForm mode={mode} next={next} />
      </div>
    </main>
  );
}
