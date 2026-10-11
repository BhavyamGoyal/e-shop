import { request } from "@/lib/api-request";
import type { Profile } from "@/server/services/auth.service";

export const fetchProfile = async (): Promise<Profile | null> =>
  (await request<{ data: Profile | null }>("GET", "/api/me")).data;

export const saveProfile = async (name: string): Promise<Profile> =>
  (await request<{ data: Profile }>("PUT", "/api/me", { name })).data;
