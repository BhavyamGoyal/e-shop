"use client";

import { useState, type FormEvent } from "react";
import { submitQuery } from "@/lib/contact-api";
import type { CustomerQueryInput } from "@/server/types/contact.types";
import { Button, Heading, Text } from "../atoms";
import { AlertMessage, FormField, TextAreaField } from "../molecules";

const EMPTY: CustomerQueryInput = { name: "", contact: "", message: "" };

export function ContactSection() {
  const [input, setInput] = useState<CustomerQueryInput>(EMPTY);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<boolean>(false);

  const change = (patch: Partial<CustomerQueryInput>): void => {
    setSent(false);
    setInput(
      (current: CustomerQueryInput): CustomerQueryInput => ({
        ...current,
        ...patch,
      }),
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await submitQuery(input);
      setInput(EMPTY);
      setSent(true);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Something went wrong",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      id="contact-us"
      aria-labelledby="contact-us-title"
      className="w-full border-t border-border bg-background"
    >
      <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-6 py-12 md:grid-cols-[1fr_1.4fr] md:px-10">
        <div className="flex flex-col gap-3">
          <Heading id="contact-us-title" level={2}>
            Have a request or a query? Tell us about it.
          </Heading>
          <Text tone="muted">
            Say hello. Our workshop is busy, we aren't. Questions, custom
            orders, a corporate gifting plan, or a garlic lamp you can't stop
            thinking about? Write to us
          </Text>
        </div>
        <form
          onSubmit={(event) => void submit(event)}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="contact-name"
              label="Name"
              required
              maxLength={100}
              autoComplete="name"
              value={input.name}
              onChange={(e) => change({ name: e.target.value })}
            />
            <FormField
              id="contact-contact"
              label="Mobile number or email"
              required
              autoComplete="email"
              value={input.contact}
              onChange={(e) => change({ contact: e.target.value })}
            />
          </div>
          <TextAreaField
            id="contact-message"
            label="Message"
            required
            rows={4}
            maxLength={2000}
            value={input.message}
            onChange={(e) => change({ message: e.target.value })}
          />
          {error ? <AlertMessage tone="danger" message={error} /> : null}
          {sent ? (
            <AlertMessage
              tone="success"
              message="Thanks! We have received your message."
            />
          ) : null}
          <div>
            <Button type="submit" disabled={busy}>
              {busy ? "Sending..." : "Send message"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
