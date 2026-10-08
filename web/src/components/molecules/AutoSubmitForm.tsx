"use client";

import { useRouter } from "next/router";
import { useRef, type ChangeEvent, type FocusEvent, type FormEvent, type ReactNode } from "react";

interface AutoSubmitFormProps {
  action: string;
  children: ReactNode;
  className?: string;
}

const isNumber = (target: EventTarget): target is HTMLInputElement =>
  target instanceof HTMLInputElement && target.type === "number";

export function AutoSubmitForm({ action, children, className }: AutoSubmitFormProps) {
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const submit = (): void => ref.current?.requestSubmit();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const params: URLSearchParams = new URLSearchParams();
    new FormData(event.currentTarget).forEach((value: FormDataEntryValue, key: string): void => {
      if (typeof value === "string" && value !== "") params.append(key, value);
    });
    const text: string = params.toString();
    router.push(text ? `${action}?${text}` : action, undefined, { shallow: true, scroll: false });
  };

  const handleChange = (event: ChangeEvent<HTMLFormElement>): void => {
    if (!isNumber(event.target)) submit();
  };

  const handleBlur = (event: FocusEvent<HTMLFormElement>): void => {
    if (isNumber(event.target) && event.target.value !== event.target.defaultValue) submit();
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} onChange={handleChange} onBlur={handleBlur} className={className}>
      {children}
    </form>
  );
}
