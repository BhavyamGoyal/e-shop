import { Text } from "../atoms";

interface LoginPromptProps {
  message: string;
  next: string;
}

export function LoginPrompt({ message, next }: LoginPromptProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-(--pp-line) bg-(--pp-card) p-5">
      <Text>{message}</Text>
      <a href={`/login?next=${encodeURIComponent(next)}`} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Log in
      </a>
    </div>
  );
}
