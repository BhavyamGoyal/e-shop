"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button, Text } from "../atoms";
import { AlertMessage, FormField, LoginPrompt } from "../molecules";
import { AuthRequiredError } from "@/lib/api-request";
import { saveProfile } from "@/lib/profile-api";
import { useProfile, type ProfileState } from "@/lib/use-profile";
import { useAccountStore } from "@/stores/account/Account.store";

interface ProfileFormProps {
  loginNext: string;
}

export function ProfileForm({ loginNext }: ProfileFormProps) {
  const { profile, loaded }: ProfileState = useProfile();
  const setProfile = useAccountStore((state) => state.setProfile);
  const reset = useAccountStore((state) => state.reset);
  const [name, setName] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [saved, setSaved] = useState<boolean>(false);

  useEffect((): void => {
    setName(profile?.name ?? "");
  }, [profile?.name]);

  if (!loaded) return <div className="h-24 animate-pulse rounded-2xl bg-muted" aria-busy />;
  if (!profile) return <LoginPrompt message="Log in to view your profile." next={loginNext} />;

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      setProfile(await saveProfile(name));
      setError("");
      setSaved(true);
    } catch (failure) {
      if (failure instanceof AuthRequiredError) reset();
      else setError(failure instanceof Error ? failure.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(event: FormEvent): void => void submit(event)} className="flex flex-col gap-4 rounded-2xl border border-(--pp-line) bg-(--pp-card) p-5">
      {error && <AlertMessage tone="danger" message={error} />}
      {saved && <AlertMessage tone="success" message="Profile updated." />}
      <FormField
        id="profile-name"
        label="Name"
        value={name}
        maxLength={80}
        required
        onChange={(event: ChangeEvent<HTMLInputElement>): void => setName(event.target.value)}
      />
      <FormField id="profile-email" label="Email" value={profile.email} readOnly disabled />
      <Text tone="muted" className="text-xs">Your email is used to sign in and cannot be changed here.</Text>
      <Button type="submit" disabled={saving} className="self-start">{saving ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}
