"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface IconFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: ReactNode;
  hint?: string;
}

const EyeIcon = ({ off }: { off: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off ? <path d="M3 3l18 18" /> : null}
  </svg>
);

export function IconField({ id, label, icon, hint, type, className, ...inputProps }: IconFieldProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const isPassword: boolean = type === "password";

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">{icon}</span>
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          placeholder={label}
          className={cn(
            "h-10 w-full rounded-lg border border-transparent bg-background/70 pl-10 text-sm text-foreground",
            isPassword ? "pr-10" : "pr-3",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
            className,
          )}
          {...inputProps}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((current: boolean) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <EyeIcon off={!visible} />
          </button>
        ) : null}
      </div>
      {hint ? <span className="px-1 text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
