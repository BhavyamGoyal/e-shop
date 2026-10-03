import { cn } from "@/lib/cn";

export interface AlertMessageProps {
  tone: "danger" | "success";
  message: string;
}

export function AlertMessage({ tone, message }: AlertMessageProps) {
  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "rounded-md px-3 py-2 text-sm",
        tone === "danger" ? "bg-danger/15 text-danger" : "bg-success/15 text-success",
      )}
    >
      {message}
    </p>
  );
}
