"use client";

import { useRef, type ChangeEvent, type FocusEvent, type ReactNode } from "react";

interface AutoSubmitFormProps {
  action: string;
  children: ReactNode;
  className?: string;
}

const isNumber = (target: EventTarget): target is HTMLInputElement =>
  target instanceof HTMLInputElement && target.type === "number";

export function AutoSubmitForm({ action, children, className }: AutoSubmitFormProps) {
  const ref = useRef<HTMLFormElement>(null);
  const submit = (): void => ref.current?.requestSubmit();

  const handleChange = (event: ChangeEvent<HTMLFormElement>): void => {
    if (!isNumber(event.target)) submit();
  };

  const handleBlur = (event: FocusEvent<HTMLFormElement>): void => {
    if (isNumber(event.target) && event.target.value !== event.target.defaultValue) submit();
  };

  return (
    <form ref={ref} action={action} method="get" onChange={handleChange} onBlur={handleBlur} className={className}>
      {children}
    </form>
  );
}
