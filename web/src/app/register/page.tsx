import type { Metadata } from "next";
import { AuthTemplate } from "@/components/templates";
import { resolveAuthPage } from "@/lib/auth-page";
import { NOT_INDEXED } from "@/lib/seo/metadata";

export const metadata: Metadata = { title: "Register", robots: NOT_INDEXED };

export default async function RegisterPage(props: PageProps<"/register">) {
  const { next } = await props.searchParams;
  return <AuthTemplate mode="register" next={await resolveAuthPage(next)} />;
}
