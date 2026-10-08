"use server";

import { redirect } from "next/navigation";
import { endSession } from "../auth/session";

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/login");
}
