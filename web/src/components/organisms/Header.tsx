import { Heading } from "../atoms";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Header({ title }: { title: string }) {
  return (
    <header className="border-b bg-surface text-surface-foreground">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Heading level={3}>{title}</Heading>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
